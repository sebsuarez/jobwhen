import os
import secrets
import hashlib
import hmac
import re
from base64 import b64encode
from datetime import date, datetime, timedelta, timezone

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy import text

from db import engine

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
SESSION_COOKIE_NAME = "jobwhen_session"
PENDING_SIGNUP_COOKIE_NAME = "jobwhen_pending_signup"
SESSION_TTL_DAYS = int(os.getenv("SESSION_TTL_DAYS", "7"))
PENDING_SIGNUP_TTL_MINUTES = int(os.getenv("PENDING_SIGNUP_TTL_MINUTES", "15"))
SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


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
        "headline": row.headline,
        "bio": row.bio,
        "location": row.location,
        "avatar": row.avatar,
        "current_level": row.current_level,
        "current_xp": row.current_xp,
        "streak_days": row.streak_days,
        "is_active": row.is_active,
        "is_mentor_approved": row.is_mentor_approved,
    }


def hash_password(password, salt=None, iterations=260000):
    if not password:
        raise RuntimeError("Password is required.")

    resolved_salt = salt or secrets.token_bytes(16)
    derived_key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        resolved_salt,
        iterations,
    )
    return (
        f"pbkdf2_sha256${iterations}${resolved_salt.hex()}$"
        f"{b64encode(derived_key).decode('utf-8')}"
    )


def is_valid_email(email):
    return bool(email and EMAIL_PATTERN.match(email))


def verify_password(password, password_hash):
    if not password_hash:
        return False

    try:
        algorithm, iteration_count, salt_hex, encoded_hash = password_hash.split("$", 3)
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    derived_key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt_hex),
        int(iteration_count),
    )
    return hmac.compare_digest(
        b64encode(derived_key).decode("utf-8"),
        encoded_hash,
    )


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
                u.headline,
                u.bio,
                u.location,
                u.avatar,
                u.current_level,
                u.current_xp,
                u.streak_days,
                u.is_active,
                r.role_id,
                r.role_name,
                mp.is_approved AS is_mentor_approved
            FROM users u
            JOIN roles r ON r.role_id = u.role_id
            LEFT JOIN mentor_profiles mp ON mp.user_id = u.user_id
            WHERE u.user_id = :user_id
            """
        ),
        {"user_id": user_id},
    ).mappings().first()

    return serialize_user(row)


def find_local_auth_user(connection, email):
    return connection.execute(
        text(
            """
            SELECT
                u.user_id,
                u.password_hash
            FROM users u
            WHERE LOWER(u.email) = LOWER(:email)
            LIMIT 1
            """
        ),
        {"email": email},
    ).mappings().first()


def find_user_by_email_or_username(connection, email, username):
    return connection.execute(
        text(
            """
            SELECT
                user_id,
                email,
                username
            FROM users
            WHERE LOWER(email) = LOWER(:email)
               OR (:username IS NOT NULL AND LOWER(username) = LOWER(:username))
            LIMIT 1
            """
        ),
        {"email": email, "username": username},
    ).mappings().first()


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
    google_sub = payload.get("sub")

    connection.execute(
        text(
            """
            UPDATE users
            SET google_sub = :google_sub
            WHERE user_id = :user_id
            """
        ),
        {
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


def create_user_from_pending_signup(
    connection,
    signup_token,
    role_name=None,
    full_name=None,
    password=None,
    mentor_job_title=None,
    mentor_company=None,
    mentor_reason=None,
):
    pending_signup = fetch_pending_signup(connection, signup_token)

    if not pending_signup:
        raise RuntimeError("Pending signup session is missing or expired.")

    if not password:
        raise RuntimeError("Password is required to complete signup.")

    resolved_role_name = role_name or "job_seeker"
    role_id = connection.execute(
        text("SELECT role_id FROM roles WHERE role_name = :role_name"),
        {"role_name": resolved_role_name},
    ).scalar_one_or_none()

    if role_id is None:
        raise RuntimeError(f"Role `{resolved_role_name}` does not exist.")

    password_hash = hash_password(password)

    user_id = connection.execute(
        text(
            """
            INSERT INTO users (role_id, password_hash, full_name, email, google_sub)
            VALUES (:role_id, :password_hash, :full_name, :email, :google_sub)
            RETURNING user_id
            """
        ),
        {
            "role_id": role_id,
            "password_hash": password_hash,
            "full_name": full_name or pending_signup["full_name"],
            "email": pending_signup["email"],
            "google_sub": pending_signup["google_sub"],
        },
    ).scalar_one()
    connection.execute(
        text("INSERT INTO user_settings (user_id) VALUES (:user_id)"),
        {"user_id": user_id},
    )

    if resolved_role_name == "mentor":
        connection.execute(
            text(
                """
                INSERT INTO mentor_profiles (user_id, company, job_title, expertise, is_approved)
                VALUES (:user_id, :company, :job_title, :expertise, FALSE)
                """
            ),
            {
                "user_id": user_id,
                "company": mentor_company.strip() if mentor_company else None,
                "job_title": mentor_job_title.strip() if mentor_job_title else None,
                "expertise": mentor_reason.strip() if mentor_reason else None,
            },
        )

    connection.execute(
        text("DELETE FROM pending_google_signups WHERE signup_token = :signup_token"),
        {"signup_token": signup_token},
    )

    return fetch_user_by_id(connection, user_id)


def update_login_streak(connection, user_id):
    # increment streak if the user logged in yesterday
    # reset to 1 if they missed a day
    # and do nothing if they already logged in today
    today = date.today()
    yesterday = today - timedelta(days=1)

    row = connection.execute(
        text("SELECT last_login_date FROM users WHERE user_id = :uid"),
        {"uid": user_id},
    ).mappings().first()

    last_login = row["last_login_date"] if row else None

    if last_login == today:
        return  # already counted today

    if last_login == yesterday:
        connection.execute(
            text(
                "UPDATE users SET streak_days = streak_days + 1, last_login_date = :today WHERE user_id = :uid"
            ),
            {"today": today, "uid": user_id},
        )
    else:
        # missed a day (or first login ever) — reset to 1
        connection.execute(
            text(
                "UPDATE users SET streak_days = 1, last_login_date = :today WHERE user_id = :uid"
            ),
            {"today": today, "uid": user_id},
        )


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
                    u.headline,
                    u.bio,
                    u.location,
                    u.avatar,
                    u.current_level,
                    u.current_xp,
                    u.streak_days,
                    u.is_active,
                    r.role_id,
                    r.role_name,
                    mp.is_approved AS is_mentor_approved
                FROM sessions s
                JOIN users u ON u.user_id = s.user_id
                JOIN roles r ON r.role_id = u.role_id
                LEFT JOIN mentor_profiles mp ON mp.user_id = u.user_id
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


def build_google_auth_result(credential):
    if not GOOGLE_CLIENT_ID:
        raise RuntimeError("GOOGLE_CLIENT_ID is not configured on the server.")

    if not credential:
        raise RuntimeError("Missing Google credential.")

    try:
        payload = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ValueError as exc:
        raise RuntimeError("Invalid Google token.") from exc

    if not payload.get("email_verified"):
        raise RuntimeError("Google account email is not verified.")

    with engine.begin() as connection:
        user = find_user_by_google_payload(connection, payload)
        if user:
            if not user.get("is_active"):
                raise RuntimeError("This account has been suspended.")
            user = update_existing_google_user(connection, user["user_id"], payload)
            update_login_streak(connection, user["user_id"])
            session_id, expires_at = create_session(connection, user["user_id"])
            user = fetch_user_by_id(connection, user["user_id"])
            return {
                "requires_signup": False,
                "user": user,
                "session_id": session_id,
                "session_expires_at": expires_at.isoformat(),
                "pending_signup": None,
            }

        pending_signup = create_pending_signup(connection, payload)
        return {
            "requires_signup": True,
            "user": None,
            "session_id": None,
            "session_expires_at": None,
            "pending_signup": {
                "email": pending_signup["email"],
                "full_name": pending_signup["full_name"],
                "expires_at": pending_signup["expires_at"].isoformat(),
                "signup_token": pending_signup["signup_token"],
            },
        }


def get_pending_signup_from_cookie(cookie_value):
    with engine.begin() as connection:
        pending_signup = fetch_pending_signup(connection, cookie_value)

    if not pending_signup:
        return None

    return {
        "email": pending_signup["email"],
        "full_name": pending_signup["full_name"],
        "expires_at": pending_signup["expires_at"],
    }


def complete_signup_from_cookie(
    cookie_value,
    role_name=None,
    full_name=None,
    password=None,
    mentor_job_title=None,
    mentor_company=None,
    mentor_reason=None,
):
    with engine.begin() as connection:
        user = create_user_from_pending_signup(
            connection,
            cookie_value,
            role_name=role_name,
            full_name=full_name,
            password=password,
            mentor_job_title=mentor_job_title,
            mentor_company=mentor_company,
            mentor_reason=mentor_reason,
        )
        update_login_streak(connection, user["user_id"])
        user = fetch_user_by_id(connection, user["user_id"])
        session_id, expires_at = create_session(connection, user["user_id"])

        return {
            "user": user,
            "session_id": session_id,
            "session_expires_at": expires_at.isoformat(),
        }


def build_local_login_result(email, password):
    if not email or not password:
        raise RuntimeError("Email and password are required.")

    with engine.begin() as connection:
        user_record = find_local_auth_user(connection, email.strip())

        if not user_record or not verify_password(password, user_record["password_hash"]):
            raise RuntimeError("Invalid email or password.")

        user = fetch_user_by_id(connection, user_record["user_id"])

        if not user.get("is_active"):
            raise RuntimeError("This account has been suspended.")

        update_login_streak(connection, user["user_id"])
        session_id, expires_at = create_session(connection, user["user_id"])
        user = fetch_user_by_id(connection, user["user_id"])

    return {
        "user": user,
        "session_id": session_id,
        "session_expires_at": expires_at.isoformat(),
    }


def build_local_signup_result(
    role_name,
    first_name,
    last_name,
    username,
    email,
    password,
    job_seeker_status=None,
    school_name=None,
    mentor_job_title=None,
    mentor_company=None,
    mentor_reason=None,
):
    if not first_name or not last_name:
        raise RuntimeError("First name and last name are required.")
    if not username:
        raise RuntimeError("Username is required.")
    if not email or not password:
        raise RuntimeError("Email and password are required.")
    if not is_valid_email(email.strip()):
        raise RuntimeError("Please enter a valid email address.")
    if len(password) < 8:
        raise RuntimeError("Password must be at least 8 characters long.")

    resolved_role_name = role_name or "job_seeker"
    if resolved_role_name not in {"job_seeker", "mentor"}:
        raise RuntimeError("Invalid signup role.")

    full_name = f"{first_name.strip()} {last_name.strip()}".strip()
    normalized_username = username.strip()
    normalized_email = email.strip()

    with engine.begin() as connection:
        existing_user = find_user_by_email_or_username(
            connection,
            normalized_email,
            normalized_username,
        )
        if existing_user:
            if existing_user["email"].lower() == normalized_email.lower():
                raise RuntimeError("An account with that email already exists.")
            raise RuntimeError("That username is already taken.")

        role_id = connection.execute(
            text("SELECT role_id FROM roles WHERE role_name = :role_name"),
            {"role_name": resolved_role_name},
        ).scalar_one_or_none()

        if role_id is None:
            raise RuntimeError(f"Role `{resolved_role_name}` does not exist.")

        user_id = connection.execute(
            text(
                """
                INSERT INTO users (
                    role_id,
                    password_hash,
                    username,
                    full_name,
                    email,
                    job_search_status,
                    school_name
                )
                VALUES (
                    :role_id,
                    :password_hash,
                    :username,
                    :full_name,
                    :email,
                    :job_search_status,
                    :school_name
                )
                RETURNING user_id
                """
            ),
            {
                "role_id": role_id,
                "password_hash": hash_password(password),
                "username": normalized_username,
                "full_name": full_name,
                "email": normalized_email,
                "job_search_status": job_seeker_status.strip() if job_seeker_status else None,
                "school_name": school_name.strip() if school_name else None,
            },
        ).scalar_one()

        connection.execute(
            text("INSERT INTO user_settings (user_id) VALUES (:user_id)"),
            {"user_id": user_id},
        )

        if resolved_role_name == "mentor":
            connection.execute(
                text(
                    """
                    INSERT INTO mentor_profiles (user_id, company, job_title, expertise, is_approved)
                    VALUES (:user_id, :company, :job_title, :expertise, FALSE)
                    """
                ),
                {
                    "user_id": user_id,
                    "company": mentor_company.strip() if mentor_company else None,
                    "job_title": mentor_job_title.strip() if mentor_job_title else None,
                    "expertise": mentor_reason.strip() if mentor_reason else None,
                },
            )

        update_login_streak(connection, user_id)
        user = fetch_user_by_id(connection, user_id)
        session_id, expires_at = create_session(connection, user["user_id"])

    return {
        "user": user,
        "session_id": session_id,
        "session_expires_at": expires_at.isoformat(),
    }
