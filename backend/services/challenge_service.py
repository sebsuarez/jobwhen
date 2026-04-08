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
        "participation_status": row["participation_status"],
        "joined_at": row["joined_at"].isoformat() if row["joined_at"] else None,
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
                    cp.participation_status,
                    cp.joined_at,
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
                        AND participation_status != 'withdrawn'
                  )
                ORDER BY c.due_date ASC
                """
            ),
            {"user_id": user_id},
        ).mappings().all()
        return [serialize_challenge(r) for r in rows]


def join_challenge(user_id, challenge_id):
    with engine.begin() as conn:
        # check the challenge exists and is approved
        challenge = conn.execute(
            text(
                """
                SELECT challenge_id, participant_limit FROM challenges
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

        if existing and existing["participation_status"] != "withdrawn":
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
                    SET participation_status = 'active', progress_count = 0, joined_at = NOW()
                    WHERE challenge_id = :cid AND user_id = :uid
                    """
                ),
                {"cid": challenge_id, "uid": user_id},
            )
        else:
            conn.execute(
                text(
                    """
                    INSERT INTO challenge_participants (challenge_id, user_id)
                    VALUES (:cid, :uid)
                    """
                ),
                {"cid": challenge_id, "uid": user_id},
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
