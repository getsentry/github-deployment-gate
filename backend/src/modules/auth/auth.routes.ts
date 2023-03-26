import express from 'express';
import passport from 'passport';

import { publicRoutes } from './auth-public.routes';
import { gitHubStrategy } from './github.strategy';
import { oAuthRoutes } from './oauth.routes';

export const authRoutes = express.Router();

passport.use(gitHubStrategy);

authRoutes.use('/auth', oAuthRoutes);
authRoutes.use('/auth', publicRoutes);
