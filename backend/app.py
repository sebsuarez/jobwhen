import os
import secrets
from datetime import datetime, timedelta, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

load_dotenv()

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")}},
    supports_credentials=True,
)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
DATABASE_URL = (
    os.getenv("DATABASE_URL")
    or f"postgresql+psycopg2://{os.getenv('DB_USER', os.getenv('POSTGRES_USER', 'seb'))}:"
    f"{os.getenv('DB_PASSWORD', os.getenv('POSTGRES_PASSWORD', '123456'))}@"
    f"{os.getenv('DB_HOST', 'db')}:{os.getenv('DB_PORT', '5432')}/"
    f"{os.getenv('DB_NAME', os.getenv('POSTGRES_DB', 'jobwhen'))}"
)
SESSION_COOKIE_NAME = "jobwhen_session"
PENDING_SIGNUP_COOKIE_NAME = "jobwhen_pending_signup"
SESSION_TTL_DAYS = int(os.getenv("SESSION_TTL_DAYS", "7"))
PENDING_SIGNUP_TTL_MINUTES = int(os.getenv("PENDING_SIGNUP_TTL_MINUTES", "15"))
SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"
engine = create_engine(DATABASE_URL, future=True)


def serialize_user(row):
    if not row:
        return None

    return {
        "user_id": row.user_id,
        "email": row.email,
        "full_name": row.full_name,
        "google_sub": row.google_sub,
        "role": {
            "role_id": row.role_id,
            "role_name": row.role_name,
        },
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


def fetch_user_by_id(connection, user_id):
    row = connection.execute(
        text(
            """
            SELECT
                u.user_id,
                u.email,
                u.full_name,
                u.google_sub,
                u.created_at,
                r.role_id,
                r.role_name
            FROM users u
            JOIN roles r ON r.role_id = u.role_id
            WHERE u.user_id = :user_id
            """
        ),
        {"user_id": user_id},
    ).mappings().first()

    return serialize_user(row)


def get_default_role_id(connection):
    role_id = connection.execute(
        text("SELECT role_id FROM roles WHERE role_name = 'job_seeker'")
    ).scalar_one_or_none()

    if role_id is None:
        raise RuntimeError("Default role `job_seeker` is missing from roles table.")

    return role_id


def find_user_by_google_payload(connection, payload):
    email = payload.get("email")
    google_sub = payload.get("sub")

    if not email or not google_sub:
        raise RuntimeError("Google payload is missing required user fields.")

    existing_user = connection.execute(
        text(
            """
            SELECT user_id
            FROM users
            WHERE email = :email OR google_sub = :google_sub
            LIMIT 1
            """
        ),
        {"email": email, "google_sub": google_sub},
    ).mappings().first()

    if existing_user:
        return fetch_user_by_id(connection, existing_user["user_id"])

    return None


def update_existing_google_user(connection, user_id, payload):
    email = payload.get("email")
    google_sub = payload.get("sub")
    full_name = payload.get("name") or email.split("@", 1)[0]

    connection.execute(
        text(
            """
            UPDATE users
            SET email = :email,
                full_name = :full_name,
                google_sub = :google_sub
            WHERE user_id = :user_id
            """
        ),
        {
            "email": email,
            "full_name": full_name,
            "google_sub": google_sub,
            "user_id": user_id,
        },
    )

    return fetch_user_by_id(connection, user_id)


def create_pending_signup(connection, payload):
    email = payload.get("email")
    google_sub = payload.get("sub")
    full_name = payload.get("name") or email.split("@", 1)[0]
    signup_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=PENDING_SIGNUP_TTL_MINUTES)

    connection.execute(
        text("DELETE FROM pending_google_signups WHERE email = :email OR google_sub = :google_sub"),
        {"email": email, "google_sub": google_sub},
    )
    connection.execute(
        text(
            """
            INSERT INTO pending_google_signups (signup_token, google_sub, email, full_name, expires_at)
            VALUES (:signup_token, :google_sub, :email, :full_name, :expires_at)
            """
        ),
        {
            "signup_token": signup_token,
            "google_sub": google_sub,
            "email": email,
            "full_name": full_name,
            "expires_at": expires_at,
        },
    )

    return {
        "signup_token": signup_token,
        "email": email,
        "google_sub": google_sub,
        "full_name": full_name,
        "expires_at": expires_at,
    }


def fetch_pending_signup(connection, signup_token):
    if not signup_token:
        return None

    row = connection.execute(
        text(
            """
            SELECT signup_token, google_sub, email, full_name, expires_at, created_at
            FROM pending_google_signups
            WHERE signup_token = :signup_token
            """
        ),
        {"signup_token": signup_token},
    ).mappings().first()

    if not row:
        return None

    expires_at = row["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at <= datetime.now(timezone.utc):
        connection.execute(
            text("DELETE FROM pending_google_signups WHERE signup_token = :signup_token"),
            {"signup_token": signup_token},
        )
        return None

    return {
        "signup_token": row["signup_token"],
        "google_sub": row["google_sub"],
        "email": row["email"],
        "full_name": row["full_name"],
        "expires_at": expires_at.isoformat(),
    }


def create_user_from_pending_signup(connection, signup_token, role_name=None, full_name=None):
    pending_signup = fetch_pending_signup(connection, signup_token)

    if not pending_signup:
        raise RuntimeError("Pending signup session is missing or expired.")

    resolved_role_name = role_name or "job_seeker"
    role_id = connection.execute(
        text("SELECT role_id FROM roles WHERE role_name = :role_name"),
        {"role_name": resolved_role_name},
    ).scalar_one_or_none()

    if role_id is None:
        raise RuntimeError(f"Role `{resolved_role_name}` does not exist.")

    user_id = connection.execute(
        text(
            """
            INSERT INTO users (role_id, full_name, email, google_sub)
            VALUES (:role_id, :full_name, :email, :google_sub)
            RETURNING user_id
            """
        ),
        {
            "role_id": role_id,
            "full_name": full_name or pending_signup["full_name"],
            "email": pending_signup["email"],
            "google_sub": pending_signup["google_sub"],
        },
    ).scalar_one()
    connection.execute(
        text("INSERT INTO user_settings (user_id) VALUES (:user_id)"),
        {"user_id": user_id},
    )
    connection.execute(
        text("DELETE FROM pending_google_signups WHERE signup_token = :signup_token"),
        {"signup_token": signup_token},
    )

    return fetch_user_by_id(connection, user_id)


def create_session(connection, user_id):
    session_id = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS)

    connection.execute(
        text(
            """
            INSERT INTO sessions (session_id, user_id, expires_at)
            VALUES (:session_id, :user_id, :expires_at)
            """
        ),
        {
            "session_id": session_id,
            "user_id": user_id,
            "expires_at": expires_at,
        },
    )

    return session_id, expires_at


def fetch_session_user(session_id):
    if not session_id:
        return None

    with engine.begin() as connection:
        row = connection.execute(
            text(
                """
                SELECT
                    s.expires_at,
                    u.user_id,
                    u.email,
                    u.full_name,
                    u.google_sub,
                    u.created_at,
                    r.role_id,
                    r.role_name
                FROM sessions s
                JOIN users u ON u.user_id = s.user_id
                JOIN roles r ON r.role_id = u.role_id
                WHERE s.session_id = :session_id
                """
            ),
            {"session_id": session_id},
        ).mappings().first()

        if not row:
            return None

        expires_at = row.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at <= datetime.now(timezone.utc):
            connection.execute(
                text("DELETE FROM sessions WHERE session_id = :session_id"),
                {"session_id": session_id},
            )
            return None

        return serialize_user(row)


def clear_session(session_id):
    if not session_id:
        return

    with engine.begin() as connection:
        connection.execute(
            text("DELETE FROM sessions WHERE session_id = :session_id"),
            {"session_id": session_id},
        )


# http://localhost:5001/health
@app.route("/health")
def health():
    return {"status": "ok"}


@app.post("/auth/google")
def google_auth():
    if not GOOGLE_CLIENT_ID:
        return jsonify({"error": "GOOGLE_CLIENT_ID is not configured on the server."}), 500

    data = request.get_json(silent=True) or {}
    credential = data.get("credential")

    if not credential:
        return jsonify({"error": "Missing Google credential."}), 400

    try:
        payload = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ValueError:
        return jsonify({"error": "Invalid Google token."}), 401

    if not payload.get("email_verified"):
        return jsonify({"error": "Google account email is not verified."}), 401

    user = None
    try:
        with engine.begin() as connection:
            user = find_user_by_google_payload(connection, payload)
            if user:
                user = update_existing_google_user(connection, user["user_id"], payload)
                session_id, expires_at = create_session(connection, user["user_id"])
            else:
                pending_signup = create_pending_signup(connection, payload)
    except (RuntimeError, SQLAlchemyError) as exc:
        return jsonify({"error": str(exc)}), 500

    if not user:
        response = jsonify(
            {
                "message": "Google account verified. Complete signup to create your account.",
                "requires_signup": True,
                "profile": {
                    "email": pending_signup["email"],
                    "full_name": pending_signup["full_name"],
                },
                "signup_expires_at": pending_signup["expires_at"],
            }
        )
        response.set_cookie(
            PENDING_SIGNUP_COOKIE_NAME,
            pending_signup["signup_token"],
            httponly=True,
            secure=SESSION_COOKIE_SECURE,
            samesite="Lax",
            max_age=PENDING_SIGNUP_TTL_MINUTES * 60,
            path="/",
        )
        return response

    response = jsonify(
        {
            "message": "Google sign-in successful.",
            "user": user,
            "session_expires_at": expires_at.isoformat(),
        }
    )
    response.set_cookie(
        SESSION_COOKIE_NAME,
        session_id,
        httponly=True,
        secure=SESSION_COOKIE_SECURE,
        samesite="Lax",
        max_age=SESSION_TTL_DAYS * 24 * 60 * 60,
        path="/",
    )
    return response


@app.get("/auth/pending-signup")
def auth_pending_signup():
    try:
        with engine.begin() as connection:
            pending_signup = fetch_pending_signup(
                connection,
                request.cookies.get(PENDING_SIGNUP_COOKIE_NAME),
            )
    except SQLAlchemyError as exc:
        return jsonify({"error": str(exc)}), 500

    if not pending_signup:
        response = jsonify({"pending_signup": None})
        response.delete_cookie(PENDING_SIGNUP_COOKIE_NAME, path="/")
        return response, 401

    return jsonify(
        {
            "pending_signup": {
                "email": pending_signup["email"],
                "full_name": pending_signup["full_name"],
                "expires_at": pending_signup["expires_at"],
            }
        }
    )


@app.post("/auth/complete-signup")
def auth_complete_signup():
    data = request.get_json(silent=True) or {}
    role_name = data.get("role_name") or "job_seeker"
    full_name = (data.get("full_name") or "").strip() or None

    try:
        with engine.begin() as connection:
            user = create_user_from_pending_signup(
                connection,
                request.cookies.get(PENDING_SIGNUP_COOKIE_NAME),
                role_name=role_name,
                full_name=full_name,
            )
            session_id, expires_at = create_session(connection, user["user_id"])
    except (RuntimeError, SQLAlchemyError) as exc:
        return jsonify({"error": str(exc)}), 400

    response = jsonify(
        {
            "message": "Account created successfully.",
            "user": user,
            "session_expires_at": expires_at.isoformat(),
        }
    )
    response.set_cookie(
        SESSION_COOKIE_NAME,
        session_id,
        httponly=True,
        secure=SESSION_COOKIE_SECURE,
        samesite="Lax",
        max_age=SESSION_TTL_DAYS * 24 * 60 * 60,
        path="/",
    )
    response.delete_cookie(PENDING_SIGNUP_COOKIE_NAME, path="/")
    return response


@app.get("/auth/me")
def auth_me():
    try:
        user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
    except SQLAlchemyError as exc:
        return jsonify({"error": str(exc)}), 500

    if not user:
        return jsonify({"user": None}), 401

    return jsonify({"user": user})


@app.post("/auth/logout")
def auth_logout():
    try:
        clear_session(request.cookies.get(SESSION_COOKIE_NAME))
    except SQLAlchemyError as exc:
        return jsonify({"error": str(exc)}), 500

    response = jsonify({"message": "Logged out successfully."})
    response.delete_cookie(SESSION_COOKIE_NAME, path="/")
    response.delete_cookie(PENDING_SIGNUP_COOKIE_NAME, path="/")
    return response
