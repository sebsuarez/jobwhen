import graphene


class RoleType(graphene.ObjectType):
    role_id = graphene.Int()
    role_name = graphene.String()


class UserType(graphene.ObjectType):
    user_id = graphene.Int()
    email = graphene.String()
    full_name = graphene.String()
    google_sub = graphene.String()
    role = graphene.Field(RoleType)
    created_at = graphene.String()
    headline = graphene.String()
    bio = graphene.String()
    location = graphene.String()
    avatar = graphene.String()
    current_level = graphene.Int()
    current_xp = graphene.Int()
    streak_days = graphene.Int()


class UpdateProfileResponse(graphene.ObjectType):
    ok = graphene.Boolean()
    message = graphene.String()
    user = graphene.Field(lambda: UserType)


class PendingSignupType(graphene.ObjectType):
    email = graphene.String()
    full_name = graphene.String()
    expires_at = graphene.String()


class AuthPayload(graphene.ObjectType):
    ok = graphene.Boolean()
    message = graphene.String()
    requires_signup = graphene.Boolean()
    user = graphene.Field(UserType)
    pending_signup = graphene.Field(PendingSignupType)
    session_expires_at = graphene.String()


# JOB APPLICATION TYPES

class JobApplicationType(graphene.ObjectType):
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


class StatusChangeType(graphene.ObjectType):
    history_id = graphene.Int()
    application_id = graphene.Int()
    old_status = graphene.String()
    new_status = graphene.String()
    changed_at = graphene.String()
    note = graphene.String()


class CreateJobApplicationInput(graphene.InputObjectType):
    company_name = graphene.String(required=True)
    role_title = graphene.String(required=True)
    location = graphene.String()
    job_link = graphene.String()
    salary_range = graphene.String()
    status = graphene.String()
    notes = graphene.String()
    application_deadline = graphene.String()
    applied_date = graphene.String()


class UpdateJobApplicationInput(graphene.InputObjectType):
    company_name = graphene.String()
    role_title = graphene.String()
    location = graphene.String()
    job_link = graphene.String()
    salary_range = graphene.String()
    notes = graphene.String()
    application_deadline = graphene.String()
    applied_date = graphene.String()


class JobApplicationResponse(graphene.ObjectType):
    ok = graphene.Boolean()
    message = graphene.String()
    application = graphene.Field(JobApplicationType)


class DeleteJobApplicationResponse(graphene.ObjectType):
    ok = graphene.Boolean()
    message = graphene.String()


# FRIENDSHIP & ENCOURAGEMENT TYPES

class FriendType(graphene.ObjectType):
    friendship_id = graphene.Int()
    user_id = graphene.Int()
    full_name = graphene.String()
    headline = graphene.String()
    current_level = graphene.Int()
    current_xp = graphene.Int()


class PendingRequestType(graphene.ObjectType):
    friendship_id = graphene.Int()
    user_id = graphene.Int()
    full_name = graphene.String()
    headline = graphene.String()
    current_level = graphene.Int()


class UserSearchResultType(graphene.ObjectType):
    user_id = graphene.Int()
    full_name = graphene.String()
    email = graphene.String()
    headline = graphene.String()
    current_level = graphene.Int()


class FriendshipResponse(graphene.ObjectType):
    ok = graphene.Boolean()
    message = graphene.String()


class EncouragementResponse(graphene.ObjectType):
    ok = graphene.Boolean()
    message = graphene.String()
