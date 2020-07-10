import { shield } from "graphql-shield";
import * as rules from "./rules";

export const permissions = shield({
  Query: {
    books: rules.isAuthenticated,
    book: rules.isAuthenticated
  },
  Mutation: {
    createBook: rules.isAuthenticated
  }
});
