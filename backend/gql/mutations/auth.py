import graphene

from gql.types import AuthPayload
from services.auth_service import (
    PENDING_SIGNUP_COOKIE_NAME,
    PENDING_SIGNUP_TTL_MINUTES,
    SESSION_COOKIE_NAME,
    SESSION_COOKIE_SECURE,
    SESSION_TTL_DAYS,
    build_google_auth_result,
    clear_session,
    complete_signup_from_cookie,
)


class GoogleAuth(graphene.Mutation):
    class Arguments:
        credential = graphene.String(required=True)

    Output = AuthPayload

    @staticmethod
    def mutate(root, info, credential):
        result = build_google_auth_result(credential)
        response = info.context["response"]

        if result["requires_signup"]:
            response.set_cookie(
                PENDING_SIGNUP_COOKIE_NAME,
                result["pending_signup"]["signup_token"],
                httponly=True,
                secure=SESSION_COOKIE_SECURE,
                samesite="Lax",
                max_age=PENDING_SIGNUP_TTL_MINUTES * 60,
                path="/",
            )
            response.delete_cookie(SESSION_COOKIE_NAME, path="/")
            return AuthPayload(
                ok=True,
                message="Google account verified. Complete signup to create your account.",
                requires_signup=True,
                pending_signup=result["pending_signup"],
            )

        response.set_cookie(
            SESSION_COOKIE_NAME,
            result["session_id"],
            httponly=True,
            secure=SESSION_COOKIE_SECURE,
            samesite="Lax",
            max_age=SESSION_TTL_DAYS * 24 * 60 * 60,
            path="/",
        )
        response.delete_cookie(PENDING_SIGNUP_COOKIE_NAME, path="/")
        return AuthPayload(
            ok=True,
            message="Google sign-in successful.",
            requires_signup=False,
            user=result["user"],
            session_expires_at=result["session_expires_at"],
        )


class CompleteSignup(graphene.Mutation):
    class Arguments:
        role_name = graphene.String(required=False)
        full_name = graphene.String(required=False)

    Output = AuthPayload

    @staticmethod
    def mutate(root, info, role_name=None, full_name=None):
        request = info.context["request"]
        response = info.context["response"]
        result = complete_signup_from_cookie(
            request.cookies.get(PENDING_SIGNUP_COOKIE_NAME),
            role_name=role_name,
            full_name=full_name,
        )
        response.set_cookie(
            SESSION_COOKIE_NAME,
            result["session_id"],
            httponly=True,
            secure=SESSION_COOKIE_SECURE,
            samesite="Lax",
            max_age=SESSION_TTL_DAYS * 24 * 60 * 60,
            path="/",
        )
        response.delete_cookie(PENDING_SIGNUP_COOKIE_NAME, path="/")
        return AuthPayload(
            ok=True,
            message="Account created successfully.",
            requires_signup=False,
            user=result["user"],
            session_expires_at=result["session_expires_at"],
        )


class Logout(graphene.Mutation):
    ok = graphene.Boolean()
    message = graphene.String()

    @staticmethod
    def mutate(root, info):
        request = info.context["request"]
        response = info.context["response"]
        clear_session(request.cookies.get(SESSION_COOKIE_NAME))
        response.delete_cookie(SESSION_COOKIE_NAME, path="/")
        response.delete_cookie(PENDING_SIGNUP_COOKIE_NAME, path="/")
        return Logout(ok=True, message="Logged out successfully.")


class AuthMutation(graphene.ObjectType):
    google_auth = GoogleAuth.Field()
    complete_signup = CompleteSignup.Field()
    logout = Logout.Field()
