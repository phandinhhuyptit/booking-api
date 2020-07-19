import { shield } from "graphql-shield";
import { ApolloError } from "apollo-server-express";
import * as rules from "./rules";

export const permissions = shield({
  Query: {
    user: rules.isAuthenticated,
    users: rules.isAuthenticated
  },
  Mutation: {
    createBook: rules.isAuthenticated
  },

},{
  fallbackError: new ApolloError("Not Authorized!", "ERR0001"),
});
