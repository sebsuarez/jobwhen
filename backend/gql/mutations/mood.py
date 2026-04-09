import graphene

from gql.types import MoodResponse
from services.auth_service import SESSION_COOKIE_NAME, fetch_session_user
from services.goal_service import submit_mood_checkin


class SubmitMoodCheckin(graphene.Mutation):
    class Arguments:
        # score range from 1 (very bad) to 5 (great)
        mood_score = graphene.Int(required=True)
        reflection = graphene.String()

    Output = MoodResponse

    @staticmethod
    def mutate(root, info, mood_score, reflection=None):
        request = info.context["request"]
        user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
        if not user:
            raise RuntimeError("Authentication required.")
        submit_mood_checkin(user_id=user["user_id"], mood_score=mood_score, reflection=reflection)
        return MoodResponse(ok=True, message="Mood check-in saved.")


class MoodMutation(graphene.ObjectType):
    submit_mood_checkin = SubmitMoodCheckin.Field()
