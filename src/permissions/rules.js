import { rule } from "graphql-shield";

export const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  // Authenticate logic is here (Verify JWT, .....).
  return true;
})