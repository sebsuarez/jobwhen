from datetime import date

from sqlalchemy import text

from db import engine
from services.xp_service import award_xp

GOAL_COMPLETION_XP_AMOUNT = 30


def serialize_goal(row):
    # converts a db row into a plain dict for a user goal
    return {
        "goal_id": row["goal_id"],
        "goal_type": row["goal_type"],
        "target_count": row["target_count"],
        "current_count": row["current_count"],
        "start_date": row["start_date"].isoformat() if row["start_date"] else None,
        "end_date": row["end_date"].isoformat() if row["end_date"] else None,
        "is_completed": row["is_completed"],
    }


def get_active_goals(user_id):
    # returns goals that are currently active
    today = date.today()
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT goal_id, goal_type, target_count, current_count,
                       start_date, end_date, is_completed
                FROM goals
                WHERE user_id = :uid
                  AND end_date >= :today
                  AND is_completed = FALSE
                ORDER BY goal_type, start_date
                """
            ),
            {"uid": user_id, "today": today},
        ).mappings().all()
        return [serialize_goal(r) for r in rows]


def complete_goal(user_id, goal_id):
    with engine.begin() as conn:
        goal = conn.execute(
            text(
                """
                SELECT goal_id, user_id, goal_type, target_count, current_count,
                       start_date, end_date, is_completed
                FROM goals
                WHERE goal_id = :goal_id
                """
            ),
            {"goal_id": goal_id},
        ).mappings().first()

        if not goal:
            raise RuntimeError("Goal not found.")

        if goal["user_id"] != user_id:
            raise RuntimeError("Not authorized to update this goal.")

        if goal["is_completed"]:
            return serialize_goal(goal)

        updated_goal = conn.execute(
            text(
                """
                UPDATE goals
                SET current_count = GREATEST(current_count, target_count),
                    is_completed = TRUE
                WHERE goal_id = :goal_id
                RETURNING goal_id, goal_type, target_count, current_count,
                          start_date, end_date, is_completed
                """
            ),
            {"goal_id": goal_id},
        ).mappings().first()

        award_xp(
            user_id=user_id,
            event_type="goal_completion",
            amount=GOAL_COMPLETION_XP_AMOUNT,
            description=f"Completed {updated_goal['goal_type']} goal",
        )

        return serialize_goal(updated_goal)


def submit_mood_checkin(user_id, mood_score, reflection=None):
    # inserts a mood check-in for the user
    # mood_score must be between 1 and 5
    if not (1 <= mood_score <= 5):
        raise RuntimeError("Mood score must be between 1 and 5.")
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                INSERT INTO mood_checkins (user_id, mood_score, reflection)
                VALUES (:uid, :score, :reflection)
                """
            ),
            {"uid": user_id, "score": mood_score, "reflection": reflection},
        )
