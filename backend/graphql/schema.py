import graphene

from graphql.mutations.auth import AuthMutation
from graphql.queries.auth import AuthQuery


class Query(AuthQuery, graphene.ObjectType):
    pass


class Mutation(AuthMutation, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation, auto_camelcase=True)
