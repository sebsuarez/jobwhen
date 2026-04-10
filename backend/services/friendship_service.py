from sqlalchemy import text

from db import engine

def serialize_friend(row):
    # converts a db row into a plain dict for an accepted friend
    return {
        "friendship_id": row["friendship_id"],
        "user_id": row["user_id"],
        "full_name": row["full_name"],
        "headline": row["headline"],
        "location": row["location"],
        "avatar": row["avatar"],
        "role_name": row["role_name"],
        "application_count": row["application_count"],
        "encouraged_you": row["encouraged_you"],
        "you_encouraged": row["you_encouraged"],
        "current_level": row["current_level"],
        "current_xp": row["current_xp"],
    }


def serialize_pending(row):
    # converts a db row into a plain dict for a pending friend request
    return {
        "friendship_id": row["friendship_id"],
        "user_id": row["user_id"],
        "full_name": row["full_name"],
        "headline": row["headline"],
        "current_level": row["current_level"],
    }


def serialize_search_result(row):
    # converts a db row into a plain dict for a user search result
    return {
        "user_id": row["user_id"],
        "full_name": row["full_name"],
        "email": row["email"],
        "headline": row["headline"],
        "current_level": row["current_level"],
    }


def get_friends(user_id):
    # returns all accepted friends for a user
    # the CASE handles both directions because the friend could be the requester or addressee
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT
                    f.friendship_id,
                    u.user_id,
                    u.full_name,
                    u.headline,
                    u.location,
                    u.avatar,
                    r.role_name,
                    (SELECT COUNT(*) FROM job_applications WHERE user_id = u.user_id) AS application_count,
                    EXISTS(SELECT 1 FROM encouragements WHERE sender_id = u.user_id AND receiver_id = :uid AND sent_at >= CURRENT_DATE) AS encouraged_you,
                    EXISTS(SELECT 1 FROM encouragements WHERE sender_id = :uid AND receiver_id = u.user_id AND sent_at >= CURRENT_DATE) AS you_encouraged,
                    u.current_level,
                    u.current_xp
                FROM friendships f
                JOIN users u ON (
                    CASE WHEN f.requester_id = :uid
                         THEN f.addressee_id
                         ELSE f.requester_id
                    END
                ) = u.user_id
                JOIN roles r ON u.role_id = r.role_id
                WHERE (f.requester_id = :uid OR f.addressee_id = :uid)
                  AND f.status = 'accepted'
                ORDER BY u.full_name
                """
            ),
            {"uid": user_id},
        ).mappings().all()
        return [serialize_friend(r) for r in rows]


def get_pending_requests(user_id):
    # only returns requests sent TO the current user, not ones they sent out
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT
                    f.friendship_id,
                    u.user_id,
                    u.full_name,
                    u.headline,
                    u.current_level
                FROM friendships f
                JOIN users u ON f.requester_id = u.user_id
                WHERE f.addressee_id = :uid AND f.status = 'pending'
                ORDER BY f.created_at DESC
                """
            ),
            {"uid": user_id},
        ).mappings().all()
        return [serialize_pending(r) for r in rows]


def search_users(current_user_id, query):
    # searches users by name or email, excludes the current user from results
    pattern = f"%{query}%"
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT u.user_id, u.full_name, u.email, u.headline, u.current_level
                FROM users u
                WHERE (u.full_name ILIKE :pattern OR u.email ILIKE :pattern)
                  AND u.user_id != :uid
                  AND u.is_active = TRUE
                LIMIT 20  -- safety cap so a broad query doesn't return thousands of rows
                """
            ),
            {"pattern": pattern, "uid": current_user_id},
        ).mappings().all()
        return [serialize_search_result(r) for r in rows]


def send_friend_request(requester_id, addressee_id):
    # checks for existing relationships before inserting to avoid duplicates
    if requester_id == addressee_id:
        raise RuntimeError("Cannot send a friend request to yourself.")

    with engine.begin() as conn:
        existing = conn.execute(
            text(
                """
                SELECT friendship_id, status FROM friendships
                WHERE (requester_id = :r AND addressee_id = :a)
                   OR (requester_id = :a AND addressee_id = :r)
                """
            ),
            {"r": requester_id, "a": addressee_id},
        ).mappings().first()

        if existing:
            if existing["status"] == "accepted":
                raise RuntimeError("Already friends.")
            if existing["status"] == "pending":
                raise RuntimeError("Friend request already pending.")
            if existing["status"] == "blocked":
                # intentionally vague as we don't want to reveal which side blocked the other
                raise RuntimeError("Unable to send request.")

        conn.execute(
            text(
                """
                INSERT INTO friendships (requester_id, addressee_id)
                VALUES (:requester_id, :addressee_id)
                """
            ),
            {"requester_id": requester_id, "addressee_id": addressee_id},
        )


def respond_to_friend_request(friendship_id, addressee_id, accept):
    # only the addressee can accept or reject (checked in the WHERE clause)
    with engine.begin() as conn:
        if accept:
            row = conn.execute(
                text(
                    """
                    UPDATE friendships
                    SET status = 'accepted'
                    WHERE friendship_id = :fid AND addressee_id = :uid
                    RETURNING friendship_id
                    """
                ),
                {"fid": friendship_id, "uid": addressee_id},
            ).fetchone()
        else:
            row = conn.execute(
                text(
                    """
                    DELETE FROM friendships
                    WHERE friendship_id = :fid AND addressee_id = :uid
                    RETURNING friendship_id
                    """
                ),
                {"fid": friendship_id, "uid": addressee_id},
            ).fetchone()

        if not row:
            raise RuntimeError("Friend request not found or not authorized.")


def remove_friend(user_id, friend_user_id):
    # deletes the accepted friendship between two users in either direction
    with engine.begin() as conn:
        row = conn.execute(
            text(
                """
                DELETE FROM friendships
                WHERE ((requester_id = :uid AND addressee_id = :fid)
                    OR (requester_id = :fid AND addressee_id = :uid))
                  AND status = 'accepted'
                RETURNING friendship_id
                """
            ),
            {"uid": user_id, "fid": friend_user_id},
        ).fetchone()

        if not row:
            raise RuntimeError("Friendship not found.")


def block_user(user_id, target_user_id):
    # removes any existing friendship first, then inserts a blocked record
    # requester_id is always set to the blocker so we know who initiated it
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                DELETE FROM friendships
                WHERE (requester_id = :uid AND addressee_id = :target)
                   OR (requester_id = :target AND addressee_id = :uid)
                """
            ),
            {"uid": user_id, "target": target_user_id},
        )
        conn.execute(
            text(
                """
                INSERT INTO friendships (requester_id, addressee_id, status)
                VALUES (:uid, :target, 'blocked')
                """
            ),
            {"uid": user_id, "target": target_user_id},
        )


def send_encouragement(sender_id, receiver_id, message=None):
    # confirms the two users are actually friends before inserting the encouragement
    with engine.begin() as conn:
        friendship = conn.execute(
            text(
                """
                SELECT friendship_id FROM friendships
                WHERE ((requester_id = :s AND addressee_id = :r)
                    OR (requester_id = :r AND addressee_id = :s))
                  AND status = 'accepted'
                """
            ),
            {"s": sender_id, "r": receiver_id},
        ).mappings().first()

        if not friendship:
            raise RuntimeError("You can only encourage friends.")

        already_sent = conn.execute(
            text(
                """
                SELECT 1 FROM encouragements
                WHERE sender_id = :s AND receiver_id = :r
                  AND sent_at >= CURRENT_DATE
                """
            ),
            {"s": sender_id, "r": receiver_id},
        ).first()

        if already_sent:
            raise RuntimeError("You can only encourage someone once per day.")

        default_msg = "Keep going, you've got this!"
        conn.execute(
            text(
                """
                INSERT INTO encouragements (sender_id, receiver_id, message)
                VALUES (:sender_id, :receiver_id, :message)
                """
            ),
            {
                "sender_id": sender_id,
                "receiver_id": receiver_id,
                "message": message or default_msg,
            },
        )
