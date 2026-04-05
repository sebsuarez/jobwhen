import graphene


class RoleType(graphene.ObjectType):
    role_id = graphene.Int()
    role_name = graphene.String()


class UserType(graphene.ObjectType):
    user_id = graphene.Int()
    email = graphene.String()
    full_name = graphene.String()
    google_sub = graphene.String()
    role = graphene.Field(RoleType)
    created_at = graphene.String()


class PendingSignupType(graphene.ObjectType):
    email = graphene.String()
    full_name = graphene.String()
    expires_at = graphene.String()


class AuthPayload(graphene.ObjectType):
    ok = graphene.Boolean()
    message = graphene.String()
    requires_signup = graphene.Boolean()
    user = graphene.Field(UserType)
    pending_signup = graphene.Field(PendingSignupType)
    session_expires_at = graphene.String()
