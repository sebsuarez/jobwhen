import graphene

from graphql.mutations.auth import AuthMutation
from graphql.mutations.jobs import JobMutation
from graphql.mutations.profile import ProfileMutation
from graphql.queries.auth import AuthQuery
from graphql.queries.jobs import JobQuery


class Query(AuthQuery, JobQuery, graphene.ObjectType):
    pass


class Mutation(AuthMutation, JobMutation, ProfileMutation, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation, auto_camelcase=True)
