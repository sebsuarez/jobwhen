import graphene

from gql.types import BurnoutAlertType, MoodCheckinType
from services.auth_service import SESSION_COOKIE_NAME, fetch_session_user
from services.mood_service import get_burnout_alerts, get_mood_history


def _require_auth(info):
    request = info.context["request"]
    user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
    if not user:
        raise RuntimeError("Authentication required.")
    return user


class MoodQuery(graphene.ObjectType):
    my_mood_history = graphene.List(MoodCheckinType)
    my_burnout_alerts = graphene.List(BurnoutAlertType)

    def resolve_my_mood_history(root, info):
        user = _require_auth(info)
        return get_mood_history(user["user_id"])

    def resolve_my_burnout_alerts(root, info):
        user = _require_auth(info)
        return get_burnout_alerts(user["user_id"])
