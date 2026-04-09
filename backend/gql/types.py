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


# CHALLENGE TYPES

class ChallengeType(graphene.ObjectType):
    challenge_id = graphene.Int()
    mentor_user_id = graphene.Int()
    mentor_name = graphene.String()
    title = graphene.String()
    description = graphene.String()
    xp_reward = graphene.Int()
    challenge_status = graphene.String()
    participant_limit = graphene.Int()
    start_date = graphene.String()
    due_date = graphene.String()
    created_at = graphene.String()


class ChallengeParticipantType(graphene.ObjectType):
    challenge_participant_id = graphene.Int()
    challenge_id = graphene.Int()
    user_id = graphene.Int()
    title = graphene.String()
    description = graphene.String()
    mentor_name = graphene.String()
    due_date = graphene.String()
    xp_reward = graphene.Int()
    progress_count = graphene.Int()
    target_count = graphene.Int()
    participation_status = graphene.String()
    joined_at = graphene.String()


class ChallengeResponse(graphene.ObjectType):
    ok = graphene.Boolean()
    message = graphene.String()


# GOAL & MOOD TYPES

class GoalType(graphene.ObjectType):
    goal_id = graphene.Int()
    goal_type = graphene.String()
    target_count = graphene.Int()
    current_count = graphene.Int()
    start_date = graphene.String()
    end_date = graphene.String()
    is_completed = graphene.Boolean()


class MoodResponse(graphene.ObjectType):
    ok = graphene.Boolean()
    message = graphene.String()


# ADMIN TYPES

class AdminUserType(graphene.ObjectType):
    user_id = graphene.Int()
    full_name = graphene.String()
    email = graphene.String()
    role_name = graphene.String()
    is_active = graphene.Boolean()
    current_level = graphene.Int()
    headline = graphene.String()
    created_at = graphene.String()


class PendingMentorType(graphene.ObjectType):
    mentor_profile_id = graphene.Int()
    user_id = graphene.Int()
    full_name = graphene.String()
    headline = graphene.String()
    company = graphene.String()
    job_title = graphene.String()
    expertise = graphene.String()


class AdminResponse(graphene.ObjectType):
    ok = graphene.Boolean()
    message = graphene.String()
