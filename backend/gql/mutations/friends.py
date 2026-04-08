import graphene

from gql.types import EncouragementResponse, FriendshipResponse
from services.auth_service import SESSION_COOKIE_NAME, fetch_session_user
from services.friendship_service import (
    block_user,
    respond_to_friend_request,
    send_encouragement,
    send_friend_request,
)


def _require_auth(info):
    # pulls the session user from the cookie, raises if not logged in
    request = info.context["request"]
    user = fetch_session_user(request.cookies.get(SESSION_COOKIE_NAME))
    if not user:
        raise RuntimeError("Authentication required.")
    return user


class SendFriendRequest(graphene.Mutation):
    class Arguments:
        addressee_id = graphene.Int(required=True)

    Output = FriendshipResponse

    @staticmethod
    def mutate(root, info, addressee_id):
        user = _require_auth(info)
        send_friend_request(
            requester_id=user["user_id"],
            addressee_id=addressee_id,
        )
        return FriendshipResponse(ok=True, message="Friend request sent.")


class RespondToFriendRequest(graphene.Mutation):
    class Arguments:
        friendship_id = graphene.Int(required=True)
        # true = accept, false = decline
        accept = graphene.Boolean(required=True)

    Output = FriendshipResponse

    @staticmethod
    def mutate(root, info, friendship_id, accept):
        user = _require_auth(info)
        respond_to_friend_request(
            friendship_id=friendship_id,
            addressee_id=user["user_id"],
            accept=accept,
        )
        msg = "Friend request accepted." if accept else "Friend request declined."
        return FriendshipResponse(ok=True, message=msg)


class SendEncouragement(graphene.Mutation):
    class Arguments:
        receiver_id = graphene.Int(required=True)
        message = graphene.String()

    Output = EncouragementResponse

    @staticmethod
    def mutate(root, info, receiver_id, message=None):
        user = _require_auth(info)
        send_encouragement(
            sender_id=user["user_id"],
            receiver_id=receiver_id,
            message=message,
        )
        return EncouragementResponse(ok=True, message="Encouragement sent!")


class BlockUser(graphene.Mutation):
    class Arguments:
        target_user_id = graphene.Int(required=True)

    Output = FriendshipResponse

    @staticmethod
    def mutate(root, info, target_user_id):
        user = _require_auth(info)
        # this also deletes any existing friendship before inserting the block
        block_user(user_id=user["user_id"], target_user_id=target_user_id)
        return FriendshipResponse(ok=True, message="User blocked.")


class FriendMutation(graphene.ObjectType):
    send_friend_request = SendFriendRequest.Field()
    respond_to_friend_request = RespondToFriendRequest.Field()
    send_encouragement = SendEncouragement.Field()
    block_user = BlockUser.Field()
