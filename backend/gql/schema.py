import graphene

from gql.mutations.auth import AuthMutation
from gql.mutations.friends import FriendMutation
from gql.mutations.jobs import JobMutation
from gql.mutations.profile import ProfileMutation
from gql.queries.auth import AuthQuery
from gql.queries.friends import FriendQuery
from gql.queries.jobs import JobQuery


class Query(AuthQuery, JobQuery, FriendQuery, graphene.ObjectType):
    pass


class Mutation(AuthMutation, JobMutation, ProfileMutation, FriendMutation, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation, auto_camelcase=True)
