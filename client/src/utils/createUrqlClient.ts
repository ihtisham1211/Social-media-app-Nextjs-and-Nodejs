import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
} from "../generated/graphql";
import { cacheExchange } from "@urql/exchange-graphcache";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { dedupExchange, fetchExchange } from "urql";

// exhanges are being used for cache updatation and deletion.
export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          logout: (_result, args, cache, info) => {
            betterUpdateQuery < LogoutMutation,
              MeQuery >
                (cache, { query: MeDocument }, _result, () => ({ me: null }));
          },
          login: (_result, args, cache, info) => {
            betterUpdateQuery < LoginMutation,
              MeQuery >
                (cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.loginUser.errors) {
                    return query;
                  } else {
                    return {
                      me: result.loginUser.user,
                    };
                  }
                });
          },
        },
      },
    }),
    ssrExchange,
    fetchExchange,
  ],
});
