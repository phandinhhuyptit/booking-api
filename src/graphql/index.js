import { mergeSchemas, makeExecutableSchema } from "graphql-tools";
import merge from "lodash.merge";
import { typeDef as User, resolver as UserResolver } from "./user";

const Query = `
  scalar Date
  type Query {
    _empty: String
  }
  type Mutation {_empty: String}
`;

const schema = makeExecutableSchema({
  typeDefs: [
    Query,
    User
  ],
  resolvers: merge(
    UserResolver
  )
});

export default mergeSchemas({
  schemas: [schema]
});
