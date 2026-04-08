import graphene

from gql.types import ChallengeParticipantType, ChallengeType
from services.auth_service import SESSION_COOKIE_NAME, fetch_session_user
from services.challenge_service import get_active_challenges, get_available_challenges


class ChallengeQuery(graphene.ObjectType):
    # challenges the user has joined and is actively working on
    active_challenges = graphene.List(ChallengeParticipantType)
    # approved challenges the user has not joined yet
    available_challenges = graphene.List(ChallengeType)

    def resolve_active_challenges(root, info):
        request = info.context["request"]
        user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
        if not user:
            raise RuntimeError("Authentication required.")
        return get_active_challenges(user["user_id"])

    def resolve_available_challenges(root, info):
        request = info.context["request"]
        user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
        if not user:
            raise RuntimeError("Authentication required.")
        return get_available_challenges(user["user_id"])
