import { mergeSchemas, makeExecutableSchema } from "graphql-tools";
import merge from "lodash.merge";
import { typeDef as Book, resolver as BookResolver } from "./book";
import { typeDef as Author, resolver as AuthorResolver } from "./author";

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
    Author,
    Book
  ],
  resolvers: merge(
    BookResolver,
    AuthorResolver
  )
});

export default mergeSchemas({
  schemas: [schema]
});
