from sqlalchemy import text

from db import engine


def serialize_pending_mentor(row):
    # converts a db row into a plain dict for a mentor profile pending approval
    return {
        "mentor_profile_id": row["mentor_profile_id"],
        "user_id": row["user_id"],
        "full_name": row["full_name"],
        "email": row["email"],
        "headline": row["headline"],
        "company": row["company"],
        "job_title": row["job_title"],
        "expertise": row["expertise"],
    }


def serialize_admin_user(row):
    # converts a db row into a plain dict for the admin user management list
    role_name = row["role_name"]
    return {
        "user_id": row["user_id"],
        "full_name": row["full_name"],
        "email": row["email"],
        # show pending_mentor for mentors who haven't been approved yet
        "role_name": "pending_mentor" if role_name == "mentor" and not row["is_mentor_approved"] else role_name,
        "is_active": row["is_active"],
        "current_level": row["current_level"],
        "headline": row["headline"],
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
    }


def get_pending_challenges():
    # returns all challenges submitted by mentors that are waiting for admin review
    from services.challenge_service import serialize_challenge
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT
                    c.challenge_id,
                    c.mentor_user_id,
                    u.full_name AS mentor_name,
                    c.title,
                    c.description,
                    c.xp_reward,
                    c.default_target_count,
                    c.max_completions_per_user,
                    c.challenge_status,
                    c.participant_limit,
                    c.start_date,
                    c.due_date,
                    c.created_at
                FROM challenges c
                JOIN users u ON u.user_id = c.mentor_user_id
                WHERE c.challenge_status = 'in_review'
                ORDER BY c.created_at ASC
                """
            )
        ).mappings().all()
        return [serialize_challenge(r) for r in rows]


def get_pending_mentors():
    # returns mentor profiles that have not been approved yet
    # a mentor signs up with is_approved=FALSE and waits for admin to approve their profile
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT
                    mp.mentor_profile_id,
                    mp.user_id,
                    u.full_name,
                    u.email,
                    u.headline,
                    mp.company,
                    mp.job_title,
                    mp.expertise
                FROM mentor_profiles mp
                JOIN users u ON u.user_id = mp.user_id
                WHERE mp.is_approved = FALSE
                ORDER BY mp.mentor_profile_id ASC
                """
            )
        ).mappings().all()
        return [serialize_pending_mentor(r) for r in rows]


def get_all_users(query=None):
    # returns all platform users
    # if a search query is provided, filters by name or email
    pattern = f"%{query}%" if query else None
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT
                    u.user_id,
                    u.full_name,
                    u.email,
                    u.headline,
                    u.current_level,
                    u.is_active,
                    u.created_at,
                    r.role_name,
                    mp.is_approved AS is_mentor_approved
                FROM users u
                JOIN roles r ON r.role_id = u.role_id
                LEFT JOIN mentor_profiles mp ON mp.user_id = u.user_id
                WHERE (:pattern IS NULL
                    OR u.full_name ILIKE :pattern
                    OR u.email ILIKE :pattern)
                ORDER BY u.full_name
                LIMIT 50
                """
            ),
            {"pattern": pattern},
        ).mappings().all()
        return [serialize_admin_user(r) for r in rows]


def approve_challenge(admin_id, challenge_id):
    # sets the challenge status to approved so it becomes visible to job seekers
    with engine.begin() as conn:
        row = conn.execute(
            text(
                """
                UPDATE challenges
                SET challenge_status = 'approved'
                WHERE challenge_id = :cid AND challenge_status = 'in_review'
                RETURNING challenge_id
                """
            ),
            {"cid": challenge_id},
        ).fetchone()

        if not row:
            raise RuntimeError("Challenge not found or not pending review.")

        conn.execute(
            text(
                """
                INSERT INTO admin_actions (admin_user_id, challenge_id, action_type, action_note)
                VALUES (:admin_id, :cid, 'approve_challenge', 'Challenge approved.')
                """
            ),
            {"admin_id": admin_id, "cid": challenge_id},
        )


def reject_challenge(admin_id, challenge_id, note=None):
    # sets the challenge status to rejected and logs the reason
    with engine.begin() as conn:
        row = conn.execute(
            text(
                """
                UPDATE challenges
                SET challenge_status = 'rejected'
                WHERE challenge_id = :cid AND challenge_status = 'in_review'
                RETURNING challenge_id
                """
            ),
            {"cid": challenge_id},
        ).fetchone()

        if not row:
            raise RuntimeError("Challenge not found or not pending review.")

        conn.execute(
            text(
                """
                INSERT INTO admin_actions (admin_user_id, challenge_id, action_type, action_note)
                VALUES (:admin_id, :cid, 'reject_challenge', :note)
                """
            ),
            {"admin_id": admin_id, "cid": challenge_id, "note": note or "Challenge rejected."},
        )


def approve_mentor(admin_id, user_id):
    # marks the mentor profile as approved so the mentor can publish challenges
    with engine.begin() as conn:
        row = conn.execute(
            text(
                """
                UPDATE mentor_profiles
                SET is_approved = TRUE
                WHERE user_id = :uid AND is_approved = FALSE
                RETURNING mentor_profile_id
                """
            ),
            {"uid": user_id},
        ).fetchone()

        if not row:
            raise RuntimeError("Mentor profile not found or already approved.")


def reject_mentor(admin_id, user_id):
    # removes the pending mentor profile and change the user to job_seeker
    with engine.begin() as conn:
        row = conn.execute(
            text(
                """
                DELETE FROM mentor_profiles
                WHERE user_id = :uid AND is_approved = FALSE
                RETURNING mentor_profile_id
                """
            ),
            {"uid": user_id},
        ).fetchone()

        if not row:
            raise RuntimeError("Mentor profile not found or already approved.")

        conn.execute(
            text(
                """
                UPDATE users
                SET role_id = (SELECT role_id FROM roles WHERE role_name = 'job_seeker')
                WHERE user_id = :uid
                """
            ),
            {"uid": user_id},
        )


def suspend_user(admin_id, target_user_id, note):
    # sets is_active=FALSE so the user cannot log in, and logs the action
    with engine.begin() as conn:
        conn.execute(
            text("UPDATE users SET is_active = FALSE WHERE user_id = :uid"),
            {"uid": target_user_id},
        )
        conn.execute(
            text(
                """
                INSERT INTO admin_actions (admin_user_id, action_type, action_note)
                VALUES (:admin_id, 'suspend_user', :note)
                """
            ),
            {"admin_id": admin_id, "note": note},
        )


def unsuspend_user(target_user_id):
    # re-enables the account by setting is_active back to TRUE
    with engine.begin() as conn:
        conn.execute(
            text("UPDATE users SET is_active = TRUE WHERE user_id = :uid"),
            {"uid": target_user_id},
        )
