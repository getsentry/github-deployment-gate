import express from 'express';

import { sentryOpenRoutes } from './sentry-open.routes';

export const sentryRoutes = express.Router();
sentryRoutes.use('/sentry', sentryOpenRoutes);
