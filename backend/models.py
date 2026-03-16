from datetime import datetime
from database import db


class Role(db.Model):
    __tablename__ = "roles"

    role_id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(30), nullable=False, unique=True)

    users = db.relationship("User", back_populates="role")


class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True)
    role_id = db.Column(db.Integer, db.ForeignKey("roles.role_id"), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    headline = db.Column(db.String(150))
    bio = db.Column(db.Text)
    location = db.Column(db.String(120))
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    role = db.relationship("Role", back_populates="users")
    job_applications = db.relationship("JobApplication", back_populates="user")


class JobApplication(db.Model):
    __tablename__ = "job_applications"

    application_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    company_name = db.Column(db.String(120), nullable=False)
    role_title = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(120))
    job_link = db.Column(db.Text)
    salary_range = db.Column(db.String(80))
    status = db.Column(db.String(20), nullable=False, default="wishlist")
    notes = db.Column(db.Text)
    application_deadline = db.Column(db.Date)
    applied_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", back_populates="job_applications")
    history = db.relationship("ApplicationHistory", back_populates="application")


class ApplicationHistory(db.Model):
    __tablename__ = "application_history"

    history_id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey("job_applications.application_id"), nullable=False)
    old_status = db.Column(db.String(20))
    new_status = db.Column(db.String(20), nullable=False)
    changed_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    note = db.Column(db.Text)

    application = db.relationship("JobApplication", back_populates="history")
