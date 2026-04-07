import graphene

from graphql.types import UpdateProfileResponse
from services.auth_service import SESSION_COOKIE_NAME, fetch_session_user
from services.profile_service import update_profile


class UpdateProfile(graphene.Mutation):
    class Arguments:
        headline = graphene.String()
        bio = graphene.String()
        location = graphene.String()

    Output = UpdateProfileResponse

    @staticmethod
    def mutate(root, info, headline=None, bio=None, location=None):
        request = info.context["request"]
        user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))

        if not user:
            raise RuntimeError("Authentication required.")

        updated_user = update_profile(
            user_id=user["user_id"],
            headline=headline,
            bio=bio,
            location=location,
        )
        return UpdateProfileResponse(ok=True, message="Profile updated.", user=updated_user)


class ProfileMutation(graphene.ObjectType):
    update_profile = UpdateProfile.Field()
