import graphene

from gql.types import JobApplicationType, LeaderboardEntryType
from services.auth_service import SESSION_COOKIE_NAME, fetch_session_user
from services.job_application_service import get_applications_by_user, get_top_users_by_applications_submitted


class JobQuery(graphene.ObjectType):
    job_applications = graphene.List(
        JobApplicationType,
        user_id=graphene.Int(required=True),
    )
    top_users_by_applications_submitted = graphene.List(LeaderboardEntryType)

    def resolve_job_applications(root, info, user_id):
        request = info.context["request"]
        session_user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))

        if not session_user:
            raise RuntimeError("Authentication required.")

        if session_user["user_id"] != user_id:
            raise RuntimeError("Not authorized to view these applications.")

        return get_applications_by_user(user_id)

    def resolve_top_users_by_applications_submitted(root, info):
        request = info.context["request"]
        session_user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))

        if not session_user:
            raise RuntimeError("Authentication required.")

        return get_top_users_by_applications_submitted()
