import graphene

from gql.types import GoalType
from services.auth_service import SESSION_COOKIE_NAME, fetch_session_user
from services.goal_service import complete_goal


def _require_auth(info):
    request = info.context["request"]
    user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
    if not user:
        raise RuntimeError("Authentication required.")
    return user


class CompleteGoal(graphene.Mutation):
    class Arguments:
        goal_id = graphene.Int(required=True)

    ok = graphene.Boolean()
    message = graphene.String()
    goal = graphene.Field(GoalType)

    @staticmethod
    def mutate(root, info, goal_id):
        user = _require_auth(info)
        goal = complete_goal(user_id=user["user_id"], goal_id=goal_id)
        return CompleteGoal(ok=True, message="Goal completed.", goal=goal)


class GoalMutation(graphene.ObjectType):
    complete_goal = CompleteGoal.Field()
