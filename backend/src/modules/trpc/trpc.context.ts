import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';

import type User from '../../models/User.model';

export const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
  return {
    user: (<any>req).user as User,
  };
};
export type TrpcContext = inferAsyncReturnType<typeof createContext>;

const trpc = initTRPC.context<TrpcContext>().create();

export const trpcMiddleware = trpc.middleware;
export const trpcRouter = trpc.router;
export const trpcProcedure = trpc.procedure;
export const mergeRouters = trpc.mergeRouters;
