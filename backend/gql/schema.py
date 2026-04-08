import graphene

from gql.mutations.admin import AdminMutation
from gql.mutations.auth import AuthMutation
from gql.mutations.challenges import ChallengeMutation
from gql.mutations.friends import FriendMutation
from gql.mutations.jobs import JobMutation
from gql.mutations.profile import ProfileMutation
from gql.queries.admin import AdminQuery
from gql.queries.auth import AuthQuery
from gql.queries.challenges import ChallengeQuery
from gql.queries.friends import FriendQuery
from gql.queries.jobs import JobQuery


class Query(AuthQuery, JobQuery, FriendQuery, ChallengeQuery, AdminQuery, graphene.ObjectType):
    pass


class Mutation(AuthMutation, JobMutation, ProfileMutation, FriendMutation, ChallengeMutation, AdminMutation, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation, auto_camelcase=True)
