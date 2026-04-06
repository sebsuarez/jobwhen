from sqlalchemy import text

from db import engine

VALID_STATUSES = {"wishlist", "applied", "interview", "offer", "rejected", "ghosted"}


def serialize_application(row):
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