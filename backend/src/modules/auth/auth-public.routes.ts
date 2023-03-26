import express from 'express';
import { InferAttributes } from 'sequelize';

import User from '../../models/User.model';
import {
  createAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './auth-tokens.utils';

export const publicRoutes = express.Router();

publicRoutes.post('/renew-access-token', async (req, res) => {
  if (!req.body.userId) {
    return res.status(400).send('userId is required');
  }

  const user = await User.findOne({
    where: {
      id: req.body.userId,
    },
  }).then(user => user?.get() as InferAttributes<User>);

  if (!user) {
    return res.status(404).send('User not found');
  }

  if (!user.refreshToken || user.refreshToken !== req.body.refreshToken) {
    return res.status(400).send('Invalid token. Please sign out and sign in again');
  }

  try {
    const [accessToken] = await Promise.all([
      createAccessToken(user),
      verifyRefreshToken(req.body.refreshToken, user.githubHandle),
      verifyAccessToken(req.body.accessToken, user.githubHandle, {
        ignoreExpiration: true,
      }),
    ]);
    return res.json({ accessToken });
  } catch (ex) {
    console.log(ex);
    res.status(400).send('Invalid token. Please sign out and sign in again');
  }
});
