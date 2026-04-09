from sqlalchemy import text

from db import engine


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


def award_xp(user_id, event_type, amount, description=None):
    raise NotImplementedError("XP awarding will be implemented in a follow-up commit.")
