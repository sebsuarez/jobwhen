from sqlalchemy import text

from db import engine

LOW_MOOD_AVERAGE_THRESHOLD = 3
LOW_MOOD_WINDOW_DAYS = 3


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


def _serialize_mood_trend(days_considered, average_score):
    return {
        "days_considered": days_considered,
        "average_score": average_score,
        "has_enough_days": days_considered >= LOW_MOOD_WINDOW_DAYS,
        "is_low_mood_trend": (
            days_considered >= LOW_MOOD_WINDOW_DAYS
            and average_score is not None
            and average_score <= LOW_MOOD_AVERAGE_THRESHOLD
        ),
    }


def _get_recent_daily_average_scores(connection, user_id):
    return connection.execute(
        text(
            """
            SELECT
                DATE(checked_in_at) AS checkin_day,
                AVG(mood_score)::FLOAT AS average_score
            FROM mood_checkins
            WHERE user_id = :user_id
            GROUP BY DATE(checked_in_at)
            ORDER BY checkin_day DESC
            LIMIT :limit
            """
        ),
        {"user_id": user_id, "limit": LOW_MOOD_WINDOW_DAYS},
    ).mappings().all()


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

    return {
        "checkin": _serialize_mood_checkin(row),
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


def get_mood_trend(user_id):
    with engine.connect() as conn:
        rows = _get_recent_daily_average_scores(conn, user_id)

    days_considered = len(rows)
    average_score = None
    if days_considered:
        average_score = round(
            sum(row["average_score"] for row in rows) / days_considered,
            2,
        )

    return _serialize_mood_trend(days_considered, average_score)
