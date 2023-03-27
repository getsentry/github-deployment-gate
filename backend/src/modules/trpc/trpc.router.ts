import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import { authRouter } from '../../modules/auth/auth.trpc';
import { ghInternalRoutes } from '../../modules/github/github.trpc';
import { trpcRouter } from './trpc.context';

export const appRouter = trpcRouter({
  auth: authRouter,
  github: ghInternalRoutes,
});

// export type definition of API
export type AppRouterType = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouterType>;
export type RouterOutput = inferRouterOutputs<AppRouterType>;
