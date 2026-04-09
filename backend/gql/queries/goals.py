import graphene

from gql.types import GoalType
from services.auth_service import SESSION_COOKIE_NAME, fetch_session_user
from services.goal_service import get_active_goals


class GoalQuery(graphene.ObjectType):
    # returns goals that are currently active for the user that is logged in
    active_goals = graphene.List(GoalType)

    def resolve_active_goals(root, info):
        request = info.context["request"]
        user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
        if not user:
            raise RuntimeError("Authentication required.")
        return get_active_goals(user["user_id"])
