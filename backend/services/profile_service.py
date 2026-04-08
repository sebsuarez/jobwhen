from sqlalchemy import text

from db import engine
from services.auth_service import fetch_user_by_id


def update_profile(user_id, headline=None, bio=None, location=None, full_name=None, avatar=None):
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                UPDATE users
                SET
                    headline  = CASE WHEN :headline  IS NOT NULL THEN :headline  ELSE headline  END,
                    bio       = CASE WHEN :bio       IS NOT NULL THEN :bio       ELSE bio       END,
                    location  = CASE WHEN :location  IS NOT NULL THEN :location  ELSE location  END,
                    full_name = CASE WHEN :full_name IS NOT NULL THEN :full_name ELSE full_name END,
                    avatar    = CASE WHEN :avatar    IS NOT NULL THEN :avatar    ELSE avatar    END
                WHERE user_id = :user_id
                """
            ),
            {
                "headline": headline,
                "bio": bio,
                "location": location,
                "full_name": full_name,
                "avatar": avatar,
                "user_id": user_id,
            },
        )
        return fetch_user_by_id(conn, user_id)
