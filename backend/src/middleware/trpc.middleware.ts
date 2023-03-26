import * as trpcExpress from '@trpc/server/adapters/express';
import passport from 'passport';

import { jwtStrategy } from '../modules/auth/jwt.strategy';
import { createContext } from '../modules/trpc/trpc.context';
import { appRouter } from '../modules/trpc/trpc.router';

passport.use(jwtStrategy);

export const trpcMiddleware = [
  passport.authenticate('jwt', { session: false }),
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
];
