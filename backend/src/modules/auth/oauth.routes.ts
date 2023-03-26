import express from 'express';
import passport from 'passport';

import User from '../../models/User.model';
import { findOrUpdateInstallation } from '../../modules/sentry/sentry.utils';
import { createAccessToken, createRefreshToken } from './auth-tokens.utils';

export const oAuthRoutes = express.Router();

oAuthRoutes.get(
  '/gh-callback',
  passport.authenticate('github', { session: false }),
  async (req, res) => {
    const sentryInstallationUUID = req.query.sentryInstallationId;

    const user = <User>req.user;

    if (!user?.id) {
      return res.status(401).send('Unauthorized');
    }

    if (sentryInstallationUUID) {
      await findOrUpdateInstallation(sentryInstallationUUID as string, user.id);
    }
    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken(user),
      createRefreshToken(user),
    ]);

    const { refreshToken: _, ...rest } = user;

    await User.update({ refreshToken }, { where: { id: user.id } });
    res.json({ accessToken, refreshToken, user: rest });
  }
);
