from sqlalchemy import text

from db import engine
from services.auth_service import fetch_user_by_id


def update_profile(user_id, headline=None, bio=None, location=None):
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                UPDATE users
                SET
                    headline = CASE WHEN :headline IS NOT NULL THEN :headline ELSE headline END,
                    bio      = CASE WHEN :bio      IS NOT NULL THEN :bio      ELSE bio      END,
                    location = CASE WHEN :location IS NOT NULL THEN :location ELSE location END
                WHERE user_id = :user_id
                """
            ),
            {
                "headline": headline,
                "bio": bio,
                "location": location,
                "user_id": user_id,
            },
        )
        return fetch_user_by_id(conn, user_id)
