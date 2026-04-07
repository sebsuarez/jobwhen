import graphene

from gql.types import AuthPayload
from services.auth_service import (
    PENDING_SIGNUP_COOKIE_NAME,
    PENDING_SIGNUP_TTL_MINUTES,
    SESSION_COOKIE_NAME,
    SESSION_COOKIE_SECURE,
    SESSION_TTL_DAYS,
    build_google_auth_result,
    build_local_login_result,
    build_local_signup_result,
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


class Login(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    Output = AuthPayload

    @staticmethod
    def mutate(root, info, email, password):
        response = info.context["response"]
        result = build_local_login_result(email, password)
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
            message="Logged in successfully.",
            requires_signup=False,
            user=result["user"],
            session_expires_at=result["session_expires_at"],
        )


class Register(graphene.Mutation):
    class Arguments:
        role_name = graphene.String(required=True)
        first_name = graphene.String(required=True)
        last_name = graphene.String(required=True)
        username = graphene.String(required=True)
        email = graphene.String(required=True)
        password = graphene.String(required=True)
        job_seeker_status = graphene.String(required=False)
        school_name = graphene.String(required=False)
        mentor_job_title = graphene.String(required=False)
        mentor_company = graphene.String(required=False)
        mentor_reason = graphene.String(required=False)

    Output = AuthPayload

    @staticmethod
    def mutate(
        root,
        info,
        role_name,
        first_name,
        last_name,
        username,
        email,
        password,
        job_seeker_status=None,
        school_name=None,
        mentor_job_title=None,
        mentor_company=None,
        mentor_reason=None,
    ):
        response = info.context["response"]
        result = build_local_signup_result(
            role_name=role_name,
            first_name=first_name,
            last_name=last_name,
            username=username,
            email=email,
            password=password,
            job_seeker_status=job_seeker_status,
            school_name=school_name,
            mentor_job_title=mentor_job_title,
            mentor_company=mentor_company,
            mentor_reason=mentor_reason,
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


class CompleteSignup(graphene.Mutation):
    class Arguments:
        role_name = graphene.String(required=False)
        full_name = graphene.String(required=False)
        password = graphene.String(required=False)

    Output = AuthPayload

    @staticmethod
    def mutate(root, info, role_name=None, full_name=None, password=None):
        request = info.context["request"]
        response = info.context["response"]
        result = complete_signup_from_cookie(
            request.cookies.get(PENDING_SIGNUP_COOKIE_NAME),
            role_name=role_name,
            full_name=full_name,
            password=password,
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
    login = Login.Field()
    register = Register.Field()
    google_auth = GoogleAuth.Field()
    complete_signup = CompleteSignup.Field()
    logout = Logout.Field()
