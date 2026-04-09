import graphene

from gql.types import ChallengeResponse
from services.auth_service import SESSION_COOKIE_NAME, fetch_session_user
from services.challenge_service import create_challenge, join_challenge, leave_challenge


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


class CreateChallenge(graphene.Mutation):
    class Arguments:
        title = graphene.String(required=True)
        description = graphene.String(required=True)
        xp_reward = graphene.Int()
        participant_limit = graphene.Int()
        start_date = graphene.String()
        due_date = graphene.String()

    Output = ChallengeResponse

    @staticmethod
    def mutate(root, info, title, description, xp_reward=None, participant_limit=None, start_date=None, due_date=None):
        user = _require_auth(info)
        if user["role"]["role_name"] != "mentor":
            raise RuntimeError("Only mentors can create challenges.")
        create_challenge(
            mentor_user_id=user["user_id"],
            title=title,
            description=description,
            xp_reward=xp_reward,
            participant_limit=participant_limit,
            start_date=start_date,
            due_date=due_date,
        )
        return ChallengeResponse(ok=True, message="Challenge submitted for review.")


class ChallengeMutation(graphene.ObjectType):
    join_challenge = JoinChallenge.Field()
    leave_challenge = LeaveChallenge.Field()
    create_challenge = CreateChallenge.Field()
