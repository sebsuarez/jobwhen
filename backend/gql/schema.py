import graphene

from gql.mutations.auth import AuthMutation
from gql.mutations.jobs import JobMutation
from gql.mutations.profile import ProfileMutation
from gql.queries.auth import AuthQuery
from gql.queries.jobs import JobQuery


class Query(AuthQuery, JobQuery, graphene.ObjectType):
    pass


class Mutation(AuthMutation, JobMutation, ProfileMutation, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation, auto_camelcase=True)
