import graphene

from gql.types import BadgeType, LeaderboardEntryType, UserBadgeType, XpEventType
from services.auth_service import SESSION_COOKIE_NAME, fetch_session_user
from services.xp_service import (
    get_all_badges,
    get_top_users_by_level,
    get_user_badges,
    get_xp_history,
)


def _require_auth(info):
    request = info.context["request"]
    user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
    if not user:
        raise RuntimeError("Authentication required.")
    return user


class XpQuery(graphene.ObjectType):
    my_badges = graphene.List(UserBadgeType)
    all_badges = graphene.List(BadgeType)
    my_xp_history = graphene.List(XpEventType)
    top_users_by_level = graphene.List(LeaderboardEntryType)

    def resolve_my_badges(root, info):
        user = _require_auth(info)
        return get_user_badges(user["user_id"])

    def resolve_all_badges(root, info):
        _require_auth(info)
        return get_all_badges()

    def resolve_my_xp_history(root, info):
        user = _require_auth(info)
        return get_xp_history(user["user_id"])

    def resolve_top_users_by_level(root, info):
        _require_auth(info)
        return get_top_users_by_level()
