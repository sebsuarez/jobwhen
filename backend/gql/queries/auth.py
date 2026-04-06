import graphene

from graphql.types import PendingSignupType, UserType
from services.auth_service import (
    PENDING_SIGNUP_COOKIE_NAME,
    SESSION_COOKIE_NAME,
    fetch_session_user,
    get_pending_signup_from_cookie,
)


class AuthQuery(graphene.ObjectType):
    me = graphene.Field(UserType)
    pending_signup = graphene.Field(PendingSignupType)

    def resolve_me(root, info):
        request = info.context["request"]
        return fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))

    def resolve_pending_signup(root, info):
        request = info.context["request"]
        return get_pending_signup_from_cookie(request.cookies.get(PENDING_SIGNUP_COOKIE_NAME))
