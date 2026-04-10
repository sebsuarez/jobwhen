from sqlalchemy import text

from db import engine


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
        "challenge_status": row["challenge_status"],
        "participant_limit": row["participant_limit"],
        "start_date": row["start_date"].isoformat() if row["start_date"] else None,
        "due_date": row["due_date"].isoformat() if row["due_date"] else None,
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
    }


def serialize_participant(row):
    # converts a db row into a plain dict for an active challenge the user joined
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
        "participation_status": row["participation_status"],
        "joined_at": row["joined_at"].isoformat() if row["joined_at"] else None,
        "completed_at": row["completed_at"].isoformat() if row["completed_at"] else None,
    }


def get_active_challenges(user_id):
    # returns all challenges the user has actively joined (not withdrawn)
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
                    c.due_date,
                    u.full_name AS mentor_name
                FROM challenge_participants cp
                JOIN challenges c ON c.challenge_id = cp.challenge_id
                JOIN users u ON u.user_id = c.mentor_user_id
                WHERE cp.user_id = :user_id
                  AND cp.participation_status = 'active'
                ORDER BY c.due_date ASC
                """
            ),
            {"user_id": user_id},
        ).mappings().all()
        return [serialize_participant(r) for r in rows]


def get_available_challenges(user_id):
    # returns approved challenges the user has NOT joined yet
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
                    c.challenge_status,
                    c.participant_limit,
                    c.start_date,
                    c.due_date,
                    c.created_at,
                    u.full_name AS mentor_name
                FROM challenges c
                JOIN users u ON u.user_id = c.mentor_user_id
                WHERE c.challenge_status = 'approved'
                  AND c.challenge_id NOT IN (
                      SELECT challenge_id FROM challenge_participants
                      WHERE user_id = :user_id
                        AND participation_status = 'active'
                  )
                ORDER BY c.due_date ASC
                """
            ),
            {"user_id": user_id},
        ).mappings().all()
        return [serialize_challenge(r) for r in rows]


def get_mentor_challenges(mentor_user_id):
    # returns all challenges created by this mentor, regardless of status
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
                    c.challenge_status,
                    c.participant_limit,
                    c.start_date,
                    c.due_date,
                    c.created_at,
                    u.full_name AS mentor_name
                FROM challenges c
                JOIN users u ON u.user_id = c.mentor_user_id
                WHERE c.mentor_user_id = :uid
                ORDER BY c.created_at DESC
                """
            ),
            {"uid": mentor_user_id},
        ).mappings().all()
        return [serialize_challenge(r) for r in rows]


def create_challenge(mentor_user_id, title, description, xp_reward, default_target_count, participant_limit, start_date, due_date):
    # inserts a new challenge with status 'in_review'
    # admin must approve before it goes live
    with engine.begin() as conn:
        row = conn.execute(
            text(
                """
                INSERT INTO challenges (
                    mentor_user_id, title, description, xp_reward, default_target_count,
                    participant_limit, start_date, due_date
                )
                VALUES (
                    :mentor_user_id, :title, :description, :xp_reward, :default_target_count,
                    :participant_limit, :start_date, :due_date
                )
                RETURNING challenge_id
                """
            ),
            {
                "mentor_user_id": mentor_user_id,
                "title": title,
                "description": description,
                "xp_reward": xp_reward or 0,
                "default_target_count": default_target_count or 1,
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
                SELECT challenge_id, participant_limit, default_target_count
                FROM challenges
                WHERE challenge_id = :cid AND challenge_status = 'approved'
                """
            ),
            {"cid": challenge_id},
        ).mappings().first()

        if not challenge:
            raise RuntimeError("Challenge not found or not available.")

        # check if user already has an active or completed entry
        existing = conn.execute(
            text(
                """
                SELECT participation_status FROM challenge_participants
                WHERE challenge_id = :cid AND user_id = :uid
                """
            ),
            {"cid": challenge_id, "uid": user_id},
        ).mappings().first()

        if existing and existing["participation_status"] == "active":
            raise RuntimeError("Already joined this challenge.")

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

        if participant["participation_status"] != "active":
            raise RuntimeError("Only active challenges can be updated.")

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
                        ELSE completed_at
                    END,
                    completion_count = CASE
                        WHEN :completed AND participation_status = 'active'
                            THEN completion_count + 1
                        ELSE completion_count
                    END
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
        merged_row["due_date"] = participant["due_date"]

        return serialize_participant(merged_row)


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
