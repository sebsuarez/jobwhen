from datetime import date

from sqlalchemy import text

from db import engine
from services.xp_service import award_xp


def serialize_challenge(row):
    # converts a db row into a plain dict for an available challenge
    return {
        "challenge_id": row["challenge_id"],
        "mentor_user_id": row["mentor_user_id"],
        "mentor_name": row["mentor_name"],
        "title": row["title"],
        "description": row["description"],
        "xp_reward": row["xp_reward"],
        "default_target_count": row["default_target_count"],
        "max_completions_per_user": row["max_completions_per_user"],
        "current_completion_count": row.get("current_completion_count"),
        "remaining_completions": row.get("remaining_completions"),
        "challenge_status": row["challenge_status"],
        "participant_limit": row["participant_limit"],
        "start_date": row["start_date"].isoformat() if row["start_date"] else None,
        "due_date": row["due_date"].isoformat() if row["due_date"] else None,
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
    }


def serialize_participant(row):
    # converts a db row into a plain dict for an active challenge the user joined
    remaining_completions = max(
        0,
        row["max_completions_per_user"] - row["completion_count"],
    )
    return {
        "challenge_participant_id": row["challenge_participant_id"],
        "challenge_id": row["challenge_id"],
        "user_id": row["user_id"],
        "title": row["title"],
        "description": row["description"],
        "mentor_name": row["mentor_name"],
        "due_date": row["due_date"].isoformat() if row["due_date"] else None,
        "xp_reward": row["xp_reward"],
        "progress_count": row["progress_count"],
        "target_count": row["target_count"],
        "completion_count": row["completion_count"],
        "max_completions_per_user": row["max_completions_per_user"],
        "remaining_completions": remaining_completions,
        "participation_status": row["participation_status"],
        "joined_at": row["joined_at"].isoformat() if row["joined_at"] else None,
        "completed_at": row["completed_at"].isoformat() if row["completed_at"] else None,
    }


def get_active_challenges(user_id):
    # returns all joined challenges that are still in progress or ready to collect
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT
                    cp.challenge_participant_id,
                    cp.challenge_id,
                    cp.user_id,
                    cp.progress_count,
                    cp.target_count,
                    cp.completion_count,
                    cp.participation_status,
                    cp.joined_at,
                    cp.completed_at,
                    c.title,
                    c.description,
                    c.xp_reward,
                    c.max_completions_per_user,
                    c.due_date,
                    u.full_name AS mentor_name
                FROM challenge_participants cp
                JOIN challenges c ON c.challenge_id = cp.challenge_id
                JOIN users u ON u.user_id = c.mentor_user_id
                WHERE cp.user_id = :user_id
                  AND cp.participation_status IN ('active', 'completed')
                ORDER BY
                    CASE WHEN cp.participation_status = 'completed' THEN 0 ELSE 1 END,
                    c.due_date ASC
                """
            ),
            {"user_id": user_id},
        ).mappings().all()
        return [serialize_participant(r) for r in rows]


def get_available_challenges(user_id):
    # returns approved challenges the user can newly join or replay after collecting
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT
                    c.challenge_id,
                    c.mentor_user_id,
                    c.title,
                    c.description,
                    c.xp_reward,
                    c.default_target_count,
                    c.max_completions_per_user,
                    COALESCE(cp.completion_count, 0) AS current_completion_count,
                    GREATEST(c.max_completions_per_user - COALESCE(cp.completion_count, 0), 0) AS remaining_completions,
                    c.challenge_status,
                    c.participant_limit,
                    c.start_date,
                    c.due_date,
                    c.created_at,
                    u.full_name AS mentor_name
                FROM challenges c
                JOIN users u ON u.user_id = c.mentor_user_id
                LEFT JOIN challenge_participants cp
                  ON cp.challenge_id = c.challenge_id
                 AND cp.user_id = :user_id
                WHERE c.challenge_status = 'approved'
                  AND (c.due_date IS NULL OR c.due_date >= CURRENT_DATE)
                  AND COALESCE(cp.participation_status, 'withdrawn') NOT IN ('active', 'completed')
                  AND COALESCE(cp.completion_count, 0) < c.max_completions_per_user
                ORDER BY c.due_date ASC
                """
            ),
            {"user_id": user_id},
        ).mappings().all()
        return [serialize_challenge(r) for r in rows]


def get_mentor_challenges(mentor_user_id):
    # returns this mentor's non-expired challenges; expired ones stay in the db
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT
                    c.challenge_id,
                    c.mentor_user_id,
                    c.title,
                    c.description,
                    c.xp_reward,
                    c.default_target_count,
                    c.max_completions_per_user,
                    c.challenge_status,
                    c.participant_limit,
                    c.start_date,
                    c.due_date,
                    c.created_at,
                    u.full_name AS mentor_name
                FROM challenges c
                JOIN users u ON u.user_id = c.mentor_user_id
                WHERE c.mentor_user_id = :uid
                  AND (c.due_date IS NULL OR c.due_date >= CURRENT_DATE)
                ORDER BY c.created_at DESC
                """
            ),
            {"uid": mentor_user_id},
        ).mappings().all()
        return [serialize_challenge(r) for r in rows]


def create_challenge(
    mentor_user_id,
    title,
    description,
    xp_reward,
    default_target_count,
    max_completions_per_user,
    participant_limit,
    start_date,
    due_date,
):
    # inserts a new challenge with status 'in_review'
    # admin must approve before it goes live
    with engine.begin() as conn:
        row = conn.execute(
            text(
                """
                INSERT INTO challenges (
                    mentor_user_id, title, description, xp_reward, default_target_count,
                    max_completions_per_user,
                    participant_limit, start_date, due_date
                )
                VALUES (
                    :mentor_user_id, :title, :description, :xp_reward, :default_target_count,
                    :max_completions_per_user,
                    :participant_limit, :start_date, :due_date
                )
                RETURNING challenge_id
                """
            ),
            {
                "mentor_user_id": mentor_user_id,
                "title": title,
                "description": description,
                "xp_reward": xp_reward if xp_reward is not None else 50,
                "default_target_count": default_target_count or 1,
                "max_completions_per_user": max_completions_per_user or 1,
                "participant_limit": participant_limit,
                "start_date": start_date,
                "due_date": due_date,
            },
        ).fetchone()
        return row[0]


def join_challenge(user_id, challenge_id):
    with engine.begin() as conn:
        # check the challenge exists and is approved
        challenge = conn.execute(
            text(
                """
                SELECT challenge_id, participant_limit, default_target_count, max_completions_per_user, due_date
                FROM challenges
                WHERE challenge_id = :cid AND challenge_status = 'approved'
                """
            ),
            {"cid": challenge_id},
        ).mappings().first()

        if not challenge:
            raise RuntimeError("Challenge not found or not available.")

        if challenge["due_date"] and challenge["due_date"] < date.today():
            raise RuntimeError("This challenge has expired.")

        # completed entries must be collected before the user can start over
        existing = conn.execute(
            text(
                """
                SELECT participation_status, completion_count FROM challenge_participants
                WHERE challenge_id = :cid AND user_id = :uid
                """
            ),
            {"cid": challenge_id, "uid": user_id},
        ).mappings().first()

        if existing and existing["participation_status"] == "active":
            raise RuntimeError("Already joined this challenge.")
        if existing and existing["participation_status"] == "completed":
            raise RuntimeError("Collect this challenge before starting it again.")
        if existing and existing["completion_count"] >= challenge["max_completions_per_user"]:
            raise RuntimeError("You have reached the completion limit for this challenge.")

        # check participant limit if one is set
        if challenge["participant_limit"]:
            count = conn.execute(
                text(
                    """
                    SELECT COUNT(*) FROM challenge_participants
                    WHERE challenge_id = :cid AND participation_status = 'active'
                    """
                ),
                {"cid": challenge_id},
            ).scalar()
            if count >= challenge["participant_limit"]:
                raise RuntimeError("Challenge is full.")

        if existing:
            # re-join after previously withdrawing (reset progress)
            conn.execute(
                text(
                    """
                    UPDATE challenge_participants
                    SET participation_status = 'active',
                        progress_count = 0,
                        target_count = :target_count,
                        completed_at = NULL,
                        joined_at = NOW()
                    WHERE challenge_id = :cid AND user_id = :uid
                    """
                ),
                {"cid": challenge_id, "uid": user_id, "target_count": challenge["default_target_count"]},
            )
        else:
            conn.execute(
                text(
                    """
                    INSERT INTO challenge_participants (challenge_id, user_id, target_count)
                    VALUES (:cid, :uid, :target_count)
                    """
                ),
                {"cid": challenge_id, "uid": user_id, "target_count": challenge["default_target_count"]},
            )


def update_challenge_progress(user_id, challenge_participant_id, delta):
    with engine.begin() as conn:
        participant = conn.execute(
            text(
                """
                SELECT
                    cp.challenge_participant_id,
                    cp.challenge_id,
                    cp.user_id,
                    cp.progress_count,
                    cp.target_count,
                    cp.completion_count,
                    cp.participation_status,
                    cp.joined_at,
                    cp.completed_at,
                    c.title,
                    c.description,
                    c.xp_reward,
                    c.max_completions_per_user,
                    c.due_date,
                    u.full_name AS mentor_name
                FROM challenge_participants cp
                JOIN challenges c ON c.challenge_id = cp.challenge_id
                JOIN users u ON u.user_id = c.mentor_user_id
                WHERE cp.challenge_participant_id = :challenge_participant_id
                """
            ),
            {"challenge_participant_id": challenge_participant_id},
        ).mappings().first()

        if not participant:
            raise RuntimeError("Challenge participant entry not found.")

        if participant["user_id"] != user_id:
            raise RuntimeError("Not authorized to update this challenge.")

        if participant["due_date"] and participant["due_date"] < date.today():
            raise RuntimeError("This challenge has expired.")

        if participant["participation_status"] not in ("active", "completed"):
            raise RuntimeError("Only joined challenges can be updated.")

        new_progress = participant["progress_count"] + delta
        new_progress = max(0, min(new_progress, participant["target_count"]))

        completed = new_progress >= participant["target_count"]
        updated_row = conn.execute(
            text(
                """
                UPDATE challenge_participants
                SET progress_count = :progress_count,
                    participation_status = CASE
                        WHEN :completed THEN 'completed'
                        ELSE 'active'
                    END,
                    completed_at = CASE
                        WHEN :completed THEN COALESCE(completed_at, CURRENT_TIMESTAMP)
                        ELSE NULL
                    END,
                    completion_count = completion_count
                WHERE challenge_participant_id = :challenge_participant_id
                RETURNING challenge_participant_id, challenge_id, user_id, progress_count,
                          target_count, completion_count, participation_status,
                          joined_at, completed_at
                """
            ),
            {
                "challenge_participant_id": challenge_participant_id,
                "progress_count": new_progress,
                "completed": completed,
            },
        ).mappings().first()

        merged_row = dict(updated_row)
        merged_row["title"] = participant["title"]
        merged_row["description"] = participant["description"]
        merged_row["mentor_name"] = participant["mentor_name"]
        merged_row["xp_reward"] = participant["xp_reward"]
        merged_row["max_completions_per_user"] = participant["max_completions_per_user"]
        merged_row["due_date"] = participant["due_date"]

        return serialize_participant(merged_row)


def collect_challenge_reward(user_id, challenge_participant_id):
    with engine.begin() as conn:
        participant = conn.execute(
            text(
                """
                SELECT
                    cp.challenge_participant_id,
                    cp.challenge_id,
                    cp.user_id,
                    cp.progress_count,
                    cp.target_count,
                    cp.completion_count,
                    cp.participation_status,
                    c.title,
                    c.xp_reward,
                    c.badge_reward_id,
                    c.due_date
                FROM challenge_participants cp
                JOIN challenges c ON c.challenge_id = cp.challenge_id
                WHERE cp.challenge_participant_id = :challenge_participant_id
                """
            ),
            {"challenge_participant_id": challenge_participant_id},
        ).mappings().first()

        if not participant:
            raise RuntimeError("Challenge participant entry not found.")

        if participant["user_id"] != user_id:
            raise RuntimeError("Not authorized to collect this reward.")

        if participant["participation_status"] != "completed":
            raise RuntimeError("This challenge is not ready to collect.")

        if participant["due_date"] and participant["due_date"] < date.today():
            raise RuntimeError("This challenge has expired.")

        xp_result = None
        if participant["xp_reward"] > 0:
            xp_result = award_xp(
                user_id=user_id,
                event_type="challenge_completed",
                amount=participant["xp_reward"],
                description=f"Completed challenge: {participant['title']}",
            )

        badge_awarded = False
        if participant["badge_reward_id"]:
            badge_row = conn.execute(
                text(
                    """
                    INSERT INTO user_badges (user_id, badge_id)
                    SELECT :user_id, :badge_id
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM user_badges
                        WHERE user_id = :user_id
                          AND badge_id = :badge_id
                    )
                    RETURNING user_badge_id
                    """
                ),
                {"user_id": user_id, "badge_id": participant["badge_reward_id"]},
            ).mappings().first()
            badge_awarded = badge_row is not None

        conn.execute(
            text(
                """
                UPDATE challenge_participants
                SET participation_status = 'withdrawn',
                    progress_count = 0,
                    completed_at = NULL,
                    completion_count = completion_count + 1
                WHERE challenge_participant_id = :challenge_participant_id
                """
            ),
            {"challenge_participant_id": challenge_participant_id},
        )

        xp_amount = xp_result["xp_event"]["xp_amount"] if xp_result else 0
        return {
            "xp_amount": xp_amount,
            "badge_awarded": badge_awarded,
        }


def get_completed_challenges_count(user_id):
    with engine.connect() as conn:
        result = conn.execute(
            text(
                """
                SELECT COALESCE(SUM(completion_count), 0)
                     + COUNT(*) FILTER (WHERE participation_status = 'completed')
                FROM challenge_participants
                WHERE user_id = :uid
                """
            ),
            {"uid": user_id},
        ).scalar()
        return int(result)


def delete_challenge(mentor_user_id, challenge_id):
    # allows a mentor to delete a challenge they created
    # to avoid foreign key conflicts we remove all the participants first
    with engine.begin() as conn:
        challenge = conn.execute(
            text("SELECT mentor_user_id FROM challenges WHERE challenge_id = :cid"),
            {"cid": challenge_id},
        ).mappings().first()

        if not challenge:
            raise RuntimeError("Challenge not found.")
        if challenge["mentor_user_id"] != mentor_user_id:
            raise RuntimeError("You can only delete your own challenges.")

        conn.execute(
            text("DELETE FROM challenge_participants WHERE challenge_id = :cid"),
            {"cid": challenge_id},
        )
        conn.execute(
            text("DELETE FROM challenges WHERE challenge_id = :cid"),
            {"cid": challenge_id},
        )


def leave_challenge(user_id, challenge_id):
    # sets status to withdrawn rather than deleting so history is preserved
    # this means if the user rejoins later we can UPDATE the existing row instead of inserting a duplicate,
    # and we keep a record of when they originally joined the challenge
    with engine.begin() as conn:
        row = conn.execute(
            text(
                """
                UPDATE challenge_participants
                SET participation_status = 'withdrawn'
                WHERE challenge_id = :cid AND user_id = :uid
                  AND participation_status = 'active'
                RETURNING challenge_participant_id
                """
            ),
            {"cid": challenge_id, "uid": user_id},
        ).fetchone()

        if not row:
            raise RuntimeError("You are not actively participating in this challenge.")
