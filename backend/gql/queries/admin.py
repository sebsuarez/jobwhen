import graphene

from gql.types import AdminUserType, ChallengeType, PendingMentorType
from services.admin_service import get_all_users, get_pending_challenges, get_pending_mentors
from services.auth_service import SESSION_COOKIE_NAME, fetch_session_user


def _require_admin(info):
    # pulls the session user and raises if they are not an admin
    request = info.context["request"]
    user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
    if not user:
        raise RuntimeError("Authentication required.")
    if user["role"]["role_name"] != "admin":
        raise RuntimeError("Admin access required.")
    return user


class AdminQuery(graphene.ObjectType):
    # challenges submitted by mentors that are waiting for admin approval
    admin_pending_challenges = graphene.List(ChallengeType)
    # mentor profiles awaiting admin approval
    admin_pending_mentors = graphene.List(PendingMentorType)
    # all users on the platform; pass an optional search query to filter by name or email
    admin_all_users = graphene.List(AdminUserType, query=graphene.String())

    def resolve_admin_pending_challenges(root, info):
        _require_admin(info)
        return get_pending_challenges()

    def resolve_admin_pending_mentors(root, info):
        _require_admin(info)
        return get_pending_mentors()

    def resolve_admin_all_users(root, info, query=None):
        _require_admin(info)
        return get_all_users(query)
