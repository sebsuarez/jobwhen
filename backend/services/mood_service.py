from sqlalchemy import text

from db import engine

LOW_MOOD_THRESHOLD = 2
BURNOUT_STREAK_LENGTH = 3
BURNOUT_TRIGGER_REASON = "Three low mood check-ins in a row"
BURNOUT_SUPPORTIVE_MESSAGE = (
    "You have been under pressure lately. Consider lowering today's goal "
    "and focusing on one small win."
)


def _serialize_mood_checkin(row):
    return {
        "mood_id": row["mood_id"],
        "user_id": row["user_id"],
        "mood_score": row["mood_score"],
        "reflection": row["reflection"],
        "checked_in_at": row["checked_in_at"].isoformat() if row["checked_in_at"] else None,
    }


def _serialize_burnout_alert(row):
    return {
        "alert_id": row["alert_id"],
        "user_id": row["user_id"],
        "trigger_reason": row["trigger_reason"],
        "supportive_message": row["supportive_message"],
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
        "resolved": row["resolved"],
    }


def _has_burnout_trend(connection, user_id):
    recent_scores = connection.execute(
        text(
            """
            SELECT mood_score
            FROM mood_checkins
            WHERE user_id = :user_id
            ORDER BY checked_in_at DESC, mood_id DESC
            LIMIT :limit
            """
        ),
        {"user_id": user_id, "limit": BURNOUT_STREAK_LENGTH},
    ).scalars().all()

    if len(recent_scores) < BURNOUT_STREAK_LENGTH:
        return False

    return all(score <= LOW_MOOD_THRESHOLD for score in recent_scores)


def _create_burnout_alert(connection, user_id):
    row = connection.execute(
        text(
            """
            INSERT INTO burnout_alerts (user_id, trigger_reason, supportive_message)
            VALUES (:user_id, :trigger_reason, :supportive_message)
            RETURNING alert_id, user_id, trigger_reason, supportive_message, created_at, resolved
            """
        ),
        {
            "user_id": user_id,
            "trigger_reason": BURNOUT_TRIGGER_REASON,
            "supportive_message": BURNOUT_SUPPORTIVE_MESSAGE,
        },
    ).mappings().first()

    return _serialize_burnout_alert(row)


def log_checkin(user_id, mood_score, reflection=None):
    if not (1 <= mood_score <= 5):
        raise RuntimeError("Mood score must be between 1 and 5.")

    with engine.begin() as conn:
        row = conn.execute(
            text(
                """
                INSERT INTO mood_checkins (user_id, mood_score, reflection)
                VALUES (:user_id, :mood_score, :reflection)
                RETURNING mood_id, user_id, mood_score, reflection, checked_in_at
                """
            ),
            {
                "user_id": user_id,
                "mood_score": mood_score,
                "reflection": reflection,
            },
        ).mappings().first()

        burnout_alert = None
        if _has_burnout_trend(conn, user_id):
            burnout_alert = _create_burnout_alert(conn, user_id)

    return {
        "checkin": _serialize_mood_checkin(row),
        "burnout_alert": burnout_alert,
    }


def get_mood_history(user_id):
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT mood_id, user_id, mood_score, reflection, checked_in_at
                FROM mood_checkins
                WHERE user_id = :user_id
                ORDER BY checked_in_at DESC, mood_id DESC
                """
            ),
            {"user_id": user_id},
        ).mappings().all()

    return [_serialize_mood_checkin(row) for row in rows]


def get_burnout_alerts(user_id):
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT alert_id, user_id, trigger_reason, supportive_message, created_at, resolved
                FROM burnout_alerts
                WHERE user_id = :user_id
                ORDER BY created_at DESC, alert_id DESC
                """
            ),
            {"user_id": user_id},
        ).mappings().all()

    return [_serialize_burnout_alert(row) for row in rows]
