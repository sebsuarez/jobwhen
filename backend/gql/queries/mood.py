import graphene

from gql.types import MoodCheckinType, MoodTrendType
from services.auth_service import SESSION_COOKIE_NAME, fetch_session_user
from services.mood_service import get_mood_history, get_mood_trend


def _require_auth(info):
    request = info.context["request"]
    user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
    if not user:
        raise RuntimeError("Authentication required.")
    return user


class MoodQuery(graphene.ObjectType):
    my_mood_history = graphene.List(MoodCheckinType)
    my_mood_trend = graphene.Field(MoodTrendType)

    def resolve_my_mood_history(root, info):
        user = _require_auth(info)
        return get_mood_history(user["user_id"])

    def resolve_my_mood_trend(root, info):
        user = _require_auth(info)
        return get_mood_trend(user["user_id"])
