from sqlalchemy import text

from db import engine
from services.xp_service import award_xp

VALID_STATUSES = {"wishlist", "applied", "interview", "offer", "rejected", "ghosted"}
APPLICATION_XP_AMOUNT = 20


def serialize_application(row):
    # this converts a db row into a plain dict that GraphQL types can read
    # we return None if no row was found
    if not row:
        return None

    def _date_str(val):
        return val.isoformat() if val is not None else None

    return {
        "application_id": row.application_id,
        "user_id": row.user_id,
        "company_name": row.company_name,
        "role_title": row.role_title,
        "location": row.location,
        "job_link": row.job_link,
        "salary_range": row.salary_range,
        "status": row.status,
        "notes": row.notes,
        "application_deadline": _date_str(row.application_deadline),
        "applied_date": _date_str(row.applied_date),
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }


def _fetch_application_by_id(connection, application_id):
    # private helper that fetches and serializes a single application by id
    row = connection.execute(
        text(
            """
            SELECT application_id, user_id, company_name, role_title, location,
                   job_link, salary_range, status, notes,
                   application_deadline, applied_date, created_at, updated_at
            FROM job_applications
            WHERE application_id = :application_id
            """
        ),
        {"application_id": application_id},
    ).mappings().first()

    return serialize_application(row)


def get_applications_by_user(user_id):
    # returns all applications for a user, most recently updated first
    with engine.begin() as conn:
        rows = conn.execute(
            text(
                """
                SELECT application_id, user_id, company_name, role_title, location,
                       job_link, salary_range, status, notes,
                       application_deadline, applied_date, created_at, updated_at
                FROM job_applications
                WHERE user_id = :user_id
                ORDER BY updated_at DESC
                """
            ),
            {"user_id": user_id},
        ).mappings().all()

    return [serialize_application(row) for row in rows]


def create_application(user_id, company_name, role_title, location=None, job_link=None,
                       salary_range=None, status="wishlist", notes=None,
                       application_deadline=None, applied_date=None):
    if status not in VALID_STATUSES:
        raise ValueError(f"Invalid status '{status}'. Must be one of: {', '.join(sorted(VALID_STATUSES))}")

    with engine.begin() as conn:
        # insert the new application and get back its generated id
        application_id = conn.execute(
            text(
                """
                INSERT INTO job_applications
                    (user_id, company_name, role_title, location, job_link,
                     salary_range, status, notes, application_deadline, applied_date)
                VALUES
                    (:user_id, :company_name, :role_title, :location, :job_link,
                     :salary_range, :status, :notes, :application_deadline, :applied_date)
                RETURNING application_id
                """
            ),
            {
                "user_id": user_id,
                "company_name": company_name,
                "role_title": role_title,
                "location": location,
                "job_link": job_link,
                "salary_range": salary_range,
                "status": status,
                "notes": notes,
                "application_deadline": application_deadline,
                "applied_date": applied_date,
            },
        ).scalar_one()

        # we log the initial status in history (old_status is NULL for a brand new application)
        conn.execute(
            text(
                """
                INSERT INTO application_history (application_id, old_status, new_status)
                VALUES (:application_id, NULL, :new_status)
                """
            ),
            {"application_id": application_id, "new_status": status},
        )

        if status == "applied":
            award_xp(
                user_id=user_id,
                event_type="job_application",
                amount=APPLICATION_XP_AMOUNT,
                description=f"Applied to {company_name} {role_title}",
            )

        return _fetch_application_by_id(conn, application_id)


def update_application_status(application_id, user_id, new_status, note=None):
    if new_status not in VALID_STATUSES:
        raise ValueError(f"Invalid status '{new_status}'. Must be one of: {', '.join(sorted(VALID_STATUSES))}")

    with engine.begin() as conn:
        # verify the application exists and belongs to the requesting user
        existing = conn.execute(
            text(
                """
                SELECT application_id, user_id, company_name, role_title, status
                FROM job_applications
                WHERE application_id = :application_id
                """
            ),
            {"application_id": application_id},
        ).mappings().first()

        if not existing:
            raise RuntimeError("Application not found.")

        if existing["user_id"] != user_id:
            raise RuntimeError("Not authorized to update this application.")

        old_status = existing["status"]

        conn.execute(
            text(
                """
                UPDATE job_applications
                SET status = :new_status, updated_at = CURRENT_TIMESTAMP
                WHERE application_id = :application_id
                """
            ),
            {"new_status": new_status, "application_id": application_id},
        )

        # record the transition in history so the timeline view can show it
        conn.execute(
            text(
                """
                INSERT INTO application_history (application_id, old_status, new_status, note)
                VALUES (:application_id, :old_status, :new_status, :note)
                """
            ),
            {
                "application_id": application_id,
                "old_status": old_status,
                "new_status": new_status,
                "note": note,
            },
        )

        if old_status != "applied" and new_status == "applied":
            award_xp(
                user_id=user_id,
                event_type="job_application",
                amount=APPLICATION_XP_AMOUNT,
                description=f"Applied to {existing['company_name']} {existing['role_title']}",
            )

        return _fetch_application_by_id(conn, application_id)


def update_application_fields(application_id, user_id, **fields):
    # only allow updating these specific columns
    allowed = {"company_name", "role_title", "location", "job_link", "salary_range",
               "status", "notes", "application_deadline", "applied_date"}
    updates = {k: v for k, v in fields.items() if k in allowed and v is not None}

    if not updates:
        raise ValueError("No valid fields provided to update.")

    with engine.begin() as conn:
        # verify the application exists and belongs to the requesting user
        existing = conn.execute(
            text("SELECT user_id FROM job_applications WHERE application_id = :application_id"),
            {"application_id": application_id},
        ).mappings().first()

        if not existing:
            raise RuntimeError("Application not found.")

        if existing["user_id"] != user_id:
            raise RuntimeError("Not authorized to update this application.")

        # build the update query from only the fields that were passed in
        set_clause = ", ".join(f"{col} = :{col}" for col in updates)
        updates["application_id"] = application_id

        conn.execute(
            text(f"UPDATE job_applications SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE application_id = :application_id"),
            updates,
        )

        return _fetch_application_by_id(conn, application_id)


def delete_application(application_id, user_id):
    with engine.begin() as conn:
        # verify the application exists and belongs to the requesting user
        existing = conn.execute(
            text("SELECT user_id FROM job_applications WHERE application_id = :application_id"),
            {"application_id": application_id},
        ).mappings().first()

        if not existing:
            raise RuntimeError("Application not found.")

        if existing["user_id"] != user_id:
            raise RuntimeError("Not authorized to delete this application.")

        # cascading delete in the DB handles application_history rows automatically
        conn.execute(
            text("DELETE FROM job_applications WHERE application_id = :application_id"),
            {"application_id": application_id},
        )
