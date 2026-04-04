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
SESSION_TTL_DAYS = int(os.getenv("SESSION_TTL_DAYS", "7"))
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


def upsert_google_user(connection, payload):
    email = payload.get("email")
    google_sub = payload.get("sub")

    if not email or not google_sub:
        raise RuntimeError("Google payload is missing required user fields.")

    full_name = payload.get("name") or email.split("@", 1)[0]

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
        user_id = existing_user["user_id"]
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
    else:
        role_id = get_default_role_id(connection)
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
                "full_name": full_name,
                "email": email,
                "google_sub": google_sub,
            },
        ).scalar_one()
        connection.execute(
            text("INSERT INTO user_settings (user_id) VALUES (:user_id)"),
            {"user_id": user_id},
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

    try:
        with engine.begin() as connection:
            user = upsert_google_user(connection, payload)
            session_id, expires_at = create_session(connection, user["user_id"])
    except (RuntimeError, SQLAlchemyError) as exc:
        return jsonify({"error": str(exc)}), 500

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
    return response
