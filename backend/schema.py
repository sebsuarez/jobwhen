import graphene
from datetime import datetime
from database import db
from models import (
    User as UserModel,
    Role as RoleModel,
    JobApplication as JobApplicationModel,
    ApplicationHistory as ApplicationHistoryModel,
)

# GRAPHQL OBJECT TYPES
# These define the shape of data returned by queries and mutations.
# Each field maps to a column on the corresponding SQLAlchemy model.
# resolve_* methods handle any transformation needed before returning a value.

class RoleType(graphene.ObjectType):
    role_id = graphene.Int()
    role_name = graphene.String()


class ApplicationHistoryType(graphene.ObjectType):
    """Records a single status change on a job application."""
    history_id = graphene.Int()
    application_id = graphene.Int()
    old_status = graphene.String()
    new_status = graphene.String()
    changed_at = graphene.String()
    note = graphene.String()

    def resolve_changed_at(parent, info):
        # Convert the datetime object to an ISO 8601 string for the client
        return parent.changed_at.isoformat() if parent.changed_at else None


class JobApplicationType(graphene.ObjectType):
    """Represents a single job application, including its full status history."""
    application_id = graphene.Int()
    user_id = graphene.Int()
    company_name = graphene.String()
    role_title = graphene.String()
    location = graphene.String()
    job_link = graphene.String()
    salary_range = graphene.String()
    status = graphene.String()
    notes = graphene.String()
    application_deadline = graphene.String()
    applied_date = graphene.String()
    created_at = graphene.String()
    updated_at = graphene.String()
    # Nested list of all past status changes for this application
    history = graphene.List(ApplicationHistoryType)

    # Date/datetime fields are stored as Python objects; convert to ISO strings here
    def resolve_application_deadline(parent, info):
        return parent.application_deadline.isoformat() if parent.application_deadline else None

    def resolve_applied_date(parent, info):
        return parent.applied_date.isoformat() if parent.applied_date else None

    def resolve_created_at(parent, info):
        return parent.created_at.isoformat() if parent.created_at else None

    def resolve_updated_at(parent, info):
        return parent.updated_at.isoformat() if parent.updated_at else None

    def resolve_history(parent, info):
        # SQLAlchemy relationship already loads the history records
        return parent.history


class UserType(graphene.ObjectType):
    """Represents an app user along with their role and job applications."""
    user_id = graphene.Int()
    role_id = graphene.Int()
    full_name = graphene.String()
    email = graphene.String()
    headline = graphene.String()
    bio = graphene.String()
    location = graphene.String()
    is_active = graphene.Boolean()
    created_at = graphene.String()
    role = graphene.Field(RoleType)
    job_applications = graphene.List(JobApplicationType)

    def resolve_created_at(parent, info):
        return parent.created_at.isoformat() if parent.created_at else None

    def resolve_role(parent, info):
        # Loaded via SQLAlchemy relationship
        return parent.role

    def resolve_job_applications(parent, info):
        return parent.job_applications


# QUERIES
class Query(graphene.ObjectType):
    # Fetch all active users
    users = graphene.List(UserType)
    # Fetch a single user by ID
    user = graphene.Field(UserType, user_id=graphene.Int(required=True))

    # Fetch all applications for a user; optionally filter by status
    job_applications = graphene.List(
        JobApplicationType,
        user_id=graphene.Int(required=True),
        status=graphene.String(),
    )
    # Fetch a single application by ID
    job_application = graphene.Field(JobApplicationType, application_id=graphene.Int(required=True))

    def resolve_users(root, info):
        # Only return users that haven't been soft deleted
        return UserModel.query.filter_by(is_active=True).all()

    def resolve_user(root, info, user_id):
        return UserModel.query.get(user_id)

    def resolve_job_applications(root, info, user_id, status=None):
        query = JobApplicationModel.query.filter_by(user_id=user_id)
        if status:
            query = query.filter_by(status=status)
        # Most recently updated applications come first
        return query.order_by(JobApplicationModel.updated_at.desc()).all()

    def resolve_job_application(root, info, application_id):
        return JobApplicationModel.query.get(application_id)


# INPUT TYPES
# These define the arguments accepted by each mutation.
# Required fields must be provided; optional fields default to None.
class CreateUserInput(graphene.InputObjectType):
    role_id = graphene.Int(required=True)
    full_name = graphene.String(required=True)
    email = graphene.String(required=True)
    headline = graphene.String()
    bio = graphene.String()
    location = graphene.String()


class UpdateUserInput(graphene.InputObjectType):
    # All fields optional — only provided fields will be updated
    full_name = graphene.String()
    headline = graphene.String()
    bio = graphene.String()
    location = graphene.String()


class CreateJobApplicationInput(graphene.InputObjectType):
    user_id = graphene.Int(required=True)
    company_name = graphene.String(required=True)
    role_title = graphene.String(required=True)
    location = graphene.String()
    job_link = graphene.String()
    salary_range = graphene.String()
    status = graphene.String()
    notes = graphene.String()

    # Expected format: YYYY-MM-DD
    application_deadline = graphene.String()
    applied_date = graphene.String()


# MUTATIONS
class CreateUser(graphene.Mutation):
    class Arguments:
        input = CreateUserInput(required=True)

    user = graphene.Field(UserType)

    # True on success, False on failure 
    ok = graphene.Boolean()

    def mutate(root, info, input):
        user = UserModel(
            role_id=input.role_id,
            full_name=input.full_name,
            email=input.email,
            headline=input.get("headline"),
            bio=input.get("bio"),
            location=input.get("location"),
        )
        db.session.add(user)
        db.session.commit()
        return CreateUser(user=user, ok=True)


class UpdateUser(graphene.Mutation):
    class Arguments:
        user_id = graphene.Int(required=True)
        input = UpdateUserInput(required=True)

    user = graphene.Field(UserType)
    ok = graphene.Boolean()

    def mutate(root, info, user_id, input):
        user = UserModel.query.get(user_id)
        if not user:
            return UpdateUser(user=None, ok=False)
        # Only update fields that were explicitly provided
        if input.get("full_name") is not None:
            user.full_name = input.full_name
        if input.get("headline") is not None:
            user.headline = input.headline
        if input.get("bio") is not None:
            user.bio = input.bio
        if input.get("location") is not None:
            user.location = input.location
        db.session.commit()
        return UpdateUser(user=user, ok=True)


class CreateJobApplication(graphene.Mutation):
    class Arguments:
        input = CreateJobApplicationInput(required=True)

    application = graphene.Field(JobApplicationType)
    ok = graphene.Boolean()

    def mutate(root, info, input):
        app_obj = JobApplicationModel(
            user_id=input.user_id,
            company_name=input.company_name,
            role_title=input.role_title,
            location=input.get("location"),
            job_link=input.get("job_link"),
            salary_range=input.get("salary_range"),
            status=input.get("status") or "wishlist",
            notes=input.get("notes"),
        )
        # Parse date strings into Python date objects before storing
        if input.get("application_deadline"):
            app_obj.application_deadline = datetime.strptime(
                input.application_deadline, "%Y-%m-%d"
            ).date()
        if input.get("applied_date"):
            app_obj.applied_date = datetime.strptime(input.applied_date, "%Y-%m-%d").date()
        db.session.add(app_obj)
        db.session.commit()
        return CreateJobApplication(application=app_obj, ok=True)


class UpdateJobApplicationStatus(graphene.Mutation):
    """Changes the status of a job application and logs the change to history."""

    class Arguments:
        application_id = graphene.Int(required=True)
        new_status = graphene.String(required=True)
        note = graphene.String()

    application = graphene.Field(JobApplicationType)
    ok = graphene.Boolean()

    def mutate(root, info, application_id, new_status, note=None):
        valid_statuses = {"wishlist", "applied", "interview", "offer", "rejected", "ghosted"}
        if new_status not in valid_statuses:
            raise ValueError(f"Invalid status. Must be one of: {valid_statuses}")

        app_obj = JobApplicationModel.query.get(application_id)
        if not app_obj:
            return UpdateJobApplicationStatus(application=None, ok=False)

        # Record the transition in the history table before applying the change
        history = ApplicationHistoryModel(
            application_id=application_id,
            old_status=app_obj.status,
            new_status=new_status,
            note=note,
        )
        db.session.add(history)
        app_obj.status = new_status
        app_obj.updated_at = datetime.utcnow()
        db.session.commit()
        return UpdateJobApplicationStatus(application=app_obj, ok=True)


class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    update_user = UpdateUser.Field()
    create_job_application = CreateJobApplication.Field()
    update_job_application_status = UpdateJobApplicationStatus.Field()


# SCHEMA — the entry point that wires queries and mutations together
schema = graphene.Schema(query=Query, mutation=Mutation)
