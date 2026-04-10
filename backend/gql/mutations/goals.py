import graphene

from gql.types import GoalType, MoodResponse
from services.auth_service import SESSION_COOKIE_NAME, fetch_session_user
from services.goal_service import upsert_goal, remove_goal, update_goal_progress


def _require_auth(info):
    request = info.context["request"]
    user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
    if not user:
        raise RuntimeError("Authentication required.")
    return user



class SetGoal(graphene.Mutation):
    class Arguments:
        goal_type = graphene.String(required=True)
        target_count = graphene.Int(required=True)

    ok = graphene.Boolean()
    message = graphene.String()
    goal = graphene.Field(GoalType)

    @staticmethod
    def mutate(root, info, goal_type, target_count):
        user = _require_auth(info)
        goal = upsert_goal(user_id=user["user_id"], goal_type=goal_type, target_count=target_count)
        return SetGoal(ok=True, message="Goal saved.", goal=goal)


class RemoveGoal(graphene.Mutation):
    class Arguments:
        goal_type = graphene.String(required=True)

    ok = graphene.Boolean()
    message = graphene.String()

    @staticmethod
    def mutate(root, info, goal_type):
        user = _require_auth(info)
        remove_goal(user_id=user["user_id"], goal_type=goal_type)
        return RemoveGoal(ok=True, message="Goal removed.")


class UpdateGoalProgress(graphene.Mutation):
    class Arguments:
        goal_id = graphene.Int(required=True)
        delta = graphene.Int(required=True)

    ok = graphene.Boolean()
    xp_awarded = graphene.Boolean()
    goal = graphene.Field(GoalType)

    @staticmethod
    def mutate(root, info, goal_id, delta):
        user = _require_auth(info)
        result = update_goal_progress(user_id=user["user_id"], goal_id=goal_id, delta=delta)
        return UpdateGoalProgress(ok=True, xp_awarded=result["xp_awarded"], goal=result["goal"])


class GoalMutation(graphene.ObjectType):
    set_goal = SetGoal.Field()
    remove_goal = RemoveGoal.Field()
    update_goal_progress = UpdateGoalProgress.Field()
