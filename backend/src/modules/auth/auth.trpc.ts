import { TRPCError } from '@trpc/server';
import { InferAttributes } from 'sequelize';

import User from '../../models/User.model';
import { trpcProcedure, trpcRouter } from '../../modules/trpc/trpc.context';

export const authRouter = trpcRouter({
  profile: trpcProcedure.query(async ({ ctx }) => {
    const user = await User.findOne({
      where: {
        id: ctx.user.id,
      },
    }).then(user => user?.get() as InferAttributes<User>);

    if (!user || !user.refreshToken) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    // filter out sensitive data
    const { refreshToken, ...rest } = user;
    return rest;
  }),

  signOut: trpcProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      });
    }

    const user = await User.findOne({
      where: {
        id: ctx.user.id,
      },
    }).then(user => user?.get() as InferAttributes<User>);

    if (!user?.refreshToken) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    await User.update({ refreshToken: null }, { where: { id: user.id } });
    return true;
  }),
});
