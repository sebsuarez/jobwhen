from datetime import date, timedelta

from sqlalchemy import text

from db import engine
from services.xp_service import award_xp

GOAL_COMPLETION_XP_AMOUNT = 30
VALID_GOAL_TYPES = {"job_application", "wellness_checkin", "interview_prep"}


def current_week_monday():
    # returns the Monday of the current ISO week
    # we reset each Monday
    today = date.today()
    return today - timedelta(days=today.weekday())


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
    # resets progress for any goals from a previous week, then returns all active goals
    monday = current_week_monday()
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                UPDATE goals
                SET current_count = 0,
                    is_completed = FALSE,
                    week_of = :monday
                WHERE user_id = :uid
                  AND week_of < :monday
                """
            ),
            {"uid": user_id, "monday": monday},
        )
        rows = conn.execute(
            text(
                """
                SELECT goal_id, goal_type, target_count, current_count,
                       start_date, end_date, is_completed
                FROM goals
                WHERE user_id = :uid
                ORDER BY goal_type
                """
            ),
            {"uid": user_id},
        ).mappings().all()
        return [serialize_goal(r) for r in rows]


def upsert_goal(user_id, goal_type, target_count):
    # creates a goal for this type, or updates the target if one already exists
    # week_of is set to the current Monday so the weekly reset works correctly
    if goal_type not in VALID_GOAL_TYPES:
        raise RuntimeError(f"Invalid goal type: {goal_type}")
    monday = current_week_monday()
    far_future = monday + timedelta(days=365)
    with engine.begin() as conn:
        row = conn.execute(
            text(
                """
                INSERT INTO goals (user_id, goal_type, target_count, current_count,
                                   week_of, start_date, end_date)
                VALUES (:uid, :goal_type, :target_count, 0,
                        :monday, :monday, :end_date)
                ON CONFLICT (user_id, goal_type)
                DO UPDATE SET target_count = EXCLUDED.target_count
                RETURNING goal_id, goal_type, target_count, current_count,
                          start_date, end_date, is_completed
                """
            ),
            {
                "uid": user_id,
                "goal_type": goal_type,
                "target_count": target_count,
                "monday": monday,
                "end_date": far_future,
            },
        ).mappings().first()
        return serialize_goal(row)


def update_goal_progress(user_id, goal_id, delta):
    # increments or decrements current_count by delta (being either +1 or -1)
    # if the progress bar reaches the target number, its marked as completed and awards XP
    with engine.begin() as conn:
        goal = conn.execute(
            text(
                """
                SELECT goal_id, user_id, goal_type, target_count, current_count, is_completed
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

        new_count = max(0, min(goal["current_count"] + delta, goal["target_count"]))
        just_completed = new_count >= goal["target_count"] and not goal["is_completed"]

        updated = conn.execute(
            text(
                """
                UPDATE goals
                SET current_count = :new_count,
                    is_completed = :is_completed
                WHERE goal_id = :goal_id
                RETURNING goal_id, goal_type, target_count, current_count,
                          start_date, end_date, is_completed
                """
            ),
            {
                "goal_id": goal_id,
                "new_count": new_count,
                "is_completed": just_completed,
            },
        ).mappings().first()

        if just_completed:
            award_xp(
                user_id=user_id,
                event_type="goal_completion",
                amount=GOAL_COMPLETION_XP_AMOUNT,
                description=f"Completed {goal['goal_type']} goal",
            )

        return {"goal": serialize_goal(updated), "xp_awarded": just_completed}


def remove_goal(user_id, goal_type):
    with engine.begin() as conn:
        conn.execute(
            text("DELETE FROM goals WHERE user_id = :uid AND goal_type = :goal_type"),
            {"uid": user_id, "goal_type": goal_type},
        )


