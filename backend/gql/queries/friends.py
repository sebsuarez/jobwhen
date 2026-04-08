import graphene

from gql.types import FriendType, PendingRequestType, UserSearchResultType
from services.auth_service import SESSION_COOKIE_NAME, fetch_session_user
from services.friendship_service import get_friends, get_pending_requests, search_users


class FriendQuery(graphene.ObjectType):
    my_friends = graphene.List(FriendType)
    pending_friend_requests = graphene.List(PendingRequestType)
    search_users = graphene.List(
        UserSearchResultType,
        query=graphene.String(required=True),
    )

    def resolve_my_friends(root, info):
        request = info.context["request"]
        user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
        if not user:
            raise RuntimeError("Authentication required.")
        return get_friends(user["user_id"])

    def resolve_pending_friend_requests(root, info):
        request = info.context["request"]
        user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
        if not user:
            raise RuntimeError("Authentication required.")
        return get_pending_requests(user["user_id"])

    def resolve_search_users(root, info, query):
        request = info.context["request"]
        user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
        if not user:
            raise RuntimeError("Authentication required.")
        # require at least 2 characters to avoid returning the entire user table
        if len(query.strip()) < 2:
            return []
        return search_users(user["user_id"], query.strip())
