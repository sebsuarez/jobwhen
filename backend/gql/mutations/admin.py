import graphene

from gql.types import AdminResponse
from services.admin_service import (
    approve_challenge,
    approve_mentor,
    reject_challenge,
    reject_mentor,
    suspend_user,
    unsuspend_user,
)
from services.auth_service import SESSION_COOKIE_NAME, fetch_session_user


def _require_admin(info):
    # pulls the session user and raises if they are not an admin
    request = info.context["request"]
    user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
    if not user:
        raise RuntimeError("Authentication required.")
    if user["role"]["role_name"] != "admin":
        raise RuntimeError("Admin access required.")
    return user


class ApproveChallenge(graphene.Mutation):
    class Arguments:
        challenge_id = graphene.Int(required=True)

    Output = AdminResponse

    @staticmethod
    def mutate(root, info, challenge_id):
        user = _require_admin(info)
        approve_challenge(admin_id=user["user_id"], challenge_id=challenge_id)
        return AdminResponse(ok=True, message="Challenge approved.")


class RejectChallenge(graphene.Mutation):
    class Arguments:
        challenge_id = graphene.Int(required=True)
        # optional note explaining why the challenge was rejected
        note = graphene.String()

    Output = AdminResponse

    @staticmethod
    def mutate(root, info, challenge_id, note=None):
        user = _require_admin(info)
        reject_challenge(admin_id=user["user_id"], challenge_id=challenge_id, note=note)
        return AdminResponse(ok=True, message="Challenge rejected.")


class ApproveMentor(graphene.Mutation):
    class Arguments:
        user_id = graphene.Int(required=True)

    Output = AdminResponse

    @staticmethod
    def mutate(root, info, user_id):
        _require_admin(info)
        approve_mentor(admin_id=None, user_id=user_id)
        return AdminResponse(ok=True, message="Mentor approved.")


class RejectMentor(graphene.Mutation):
    class Arguments:
        user_id = graphene.Int(required=True)

    Output = AdminResponse

    @staticmethod
    def mutate(root, info, user_id):
        _require_admin(info)
        reject_mentor(admin_id=None, user_id=user_id)
        return AdminResponse(ok=True, message="Mentor application rejected.")


class SuspendUser(graphene.Mutation):
    class Arguments:
        target_user_id = graphene.Int(required=True)
        note = graphene.String(required=True)

    Output = AdminResponse

    @staticmethod
    def mutate(root, info, target_user_id, note):
        user = _require_admin(info)
        suspend_user(admin_id=user["user_id"], target_user_id=target_user_id, note=note)
        return AdminResponse(ok=True, message="User suspended.")


class UnsuspendUser(graphene.Mutation):
    class Arguments:
        target_user_id = graphene.Int(required=True)

    Output = AdminResponse

    @staticmethod
    def mutate(root, info, target_user_id):
        _require_admin(info)
        unsuspend_user(target_user_id=target_user_id)
        return AdminResponse(ok=True, message="User unsuspended.")


class AdminMutation(graphene.ObjectType):
    approve_challenge = ApproveChallenge.Field()
    reject_challenge = RejectChallenge.Field()
    approve_mentor = ApproveMentor.Field()
    reject_mentor = RejectMentor.Field()
    suspend_user = SuspendUser.Field()
    unsuspend_user = UnsuspendUser.Field()
