import { rule } from "graphql-shield";

export const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  if (!ctx.user) {
    return false;
  }

  const status = ctx?.user?.status;
  if (status && Number(status) > 0) {
    return true;
  }
  return false;
});