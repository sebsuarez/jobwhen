import graphene

from gql.mutations.auth import AuthMutation
from gql.queries.auth import AuthQuery


class Query(AuthQuery, graphene.ObjectType):
    pass


class Mutation(AuthMutation, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation, auto_camelcase=True)
