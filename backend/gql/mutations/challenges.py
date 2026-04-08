import graphene

from gql.types import ChallengeResponse
from services.auth_service import SESSION_COOKIE_NAME, fetch_session_user
from services.challenge_service import join_challenge, leave_challenge


def _require_auth(info):
    # shared helper — pulls the session user from the cookie, raises if not logged in
    request = info.context["request"]
    user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
    if not user:
        raise RuntimeError("Authentication required.")
    return user


class JoinChallenge(graphene.Mutation):
    class Arguments:
        challenge_id = graphene.Int(required=True)

    Output = ChallengeResponse

    @staticmethod
    def mutate(root, info, challenge_id):
        user = _require_auth(info)
        join_challenge(user_id=user["user_id"], challenge_id=challenge_id)
        return ChallengeResponse(ok=True, message="Joined challenge.")


class LeaveChallenge(graphene.Mutation):
    class Arguments:
        challenge_id = graphene.Int(required=True)

    Output = ChallengeResponse

    @staticmethod
    def mutate(root, info, challenge_id):
        user = _require_auth(info)
        leave_challenge(user_id=user["user_id"], challenge_id=challenge_id)
        return ChallengeResponse(ok=True, message="Left challenge.")


class ChallengeMutation(graphene.ObjectType):
    join_challenge = JoinChallenge.Field()
    leave_challenge = LeaveChallenge.Field()
