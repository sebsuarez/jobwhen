from sqlalchemy import text

from db import engine

XP_PER_LEVEL = 60


def _serialize_badge(row):
    return {
        "badge_id": row["badge_id"],
        "badge_name": row["badge_name"],
        "description": row["description"],
        "level_required": row["level_required"],
        "icon_name": row["icon_name"],
    }


def _serialize_user_badge(row):
    return {
        "user_badge_id": row["user_badge_id"],
        "user_id": row["user_id"],
        "earned_at": row["earned_at"].isoformat() if row["earned_at"] else None,
        "badge": _serialize_badge(row),
    }


def _serialize_xp_event(row):
    return {
        "xp_event_id": row["xp_event_id"],
        "user_id": row["user_id"],
        "event_type": row["event_type"],
        "xp_amount": row["xp_amount"],
        "description": row["description"],
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
    }


def get_all_badges():
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT badge_id, badge_name, description, level_required, icon_name
                FROM badges
                ORDER BY level_required NULLS LAST, badge_id
                """
            )
        ).mappings().all()

    return [_serialize_badge(row) for row in rows]


def get_user_badges(user_id):
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT
                    ub.user_badge_id,
                    ub.user_id,
                    ub.earned_at,
                    b.badge_id,
                    b.badge_name,
                    b.description,
                    b.level_required,
                    b.icon_name
                FROM user_badges ub
                JOIN badges b ON b.badge_id = ub.badge_id
                WHERE ub.user_id = :user_id
                ORDER BY ub.earned_at DESC, ub.user_badge_id DESC
                """
            ),
            {"user_id": user_id},
        ).mappings().all()

    return [_serialize_user_badge(row) for row in rows]


def get_xp_history(user_id):
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT xp_event_id, user_id, event_type, xp_amount, description, created_at
                FROM xp_events
                WHERE user_id = :user_id
                ORDER BY created_at DESC, xp_event_id DESC
                """
            ),
            {"user_id": user_id},
        ).mappings().all()

    return [_serialize_xp_event(row) for row in rows]


def calculate_level(total_xp):
    return max(1, (total_xp // XP_PER_LEVEL) + 1)


def _unlock_level_badges(connection, user_id, current_level):
    rows = connection.execute(
        text(
            """
            INSERT INTO user_badges (user_id, badge_id)
            SELECT :user_id, b.badge_id
            FROM badges b
            WHERE b.level_required IS NOT NULL
              AND b.level_required <= :current_level
              AND NOT EXISTS (
                  SELECT 1
                  FROM user_badges ub
                  WHERE ub.user_id = :user_id
                    AND ub.badge_id = b.badge_id
              )
            RETURNING user_badge_id, user_id, earned_at
            """
        ),
        {"user_id": user_id, "current_level": current_level},
    ).mappings().all()

    if not rows:
        return []

    unlocked_badges = []
    for row in rows:
        badge_row = connection.execute(
            text(
                """
                SELECT badge_id, badge_name, description, level_required, icon_name
                FROM badges
                WHERE badge_id = (
                    SELECT badge_id
                    FROM user_badges
                    WHERE user_badge_id = :user_badge_id
                )
                """
            ),
            {"user_badge_id": row["user_badge_id"]},
        ).mappings().first()
        unlocked_badges.append(
            {
                "user_badge_id": row["user_badge_id"],
                "user_id": row["user_id"],
                "earned_at": row["earned_at"].isoformat() if row["earned_at"] else None,
                "badge": _serialize_badge(badge_row),
            }
        )

    return unlocked_badges


def award_xp(user_id, event_type, amount, description=None):
    if not event_type or not event_type.strip():
        raise ValueError("Event type is required.")

    if amount <= 0:
        raise ValueError("XP amount must be greater than 0.")

    with engine.begin() as conn:
        xp_event = conn.execute(
            text(
                """
                INSERT INTO xp_events (user_id, event_type, xp_amount, description)
                VALUES (:user_id, :event_type, :amount, :description)
                RETURNING xp_event_id, user_id, event_type, xp_amount, description, created_at
                """
            ),
            {
                "user_id": user_id,
                "event_type": event_type.strip(),
                "amount": amount,
                "description": description,
            },
        ).mappings().first()

        user_row = conn.execute(
            text(
                """
                SELECT current_xp
                FROM users
                WHERE user_id = :user_id
                """
            ),
            {"user_id": user_id},
        ).mappings().first()

        if not user_row:
            raise RuntimeError("User not found.")

        new_total_xp = user_row["current_xp"] + amount
        new_level = calculate_level(new_total_xp)

        conn.execute(
            text(
                """
                UPDATE users
                SET current_xp = :current_xp,
                    current_level = :current_level
                WHERE user_id = :user_id
                """
            ),
            {
                "user_id": user_id,
                "current_xp": new_total_xp,
                "current_level": new_level,
            },
        )

        unlocked_badges = _unlock_level_badges(conn, user_id, new_level)

        return {
            "xp_event": _serialize_xp_event(xp_event),
            "current_xp": new_total_xp,
            "current_level": new_level,
            "unlocked_badges": unlocked_badges,
        }
