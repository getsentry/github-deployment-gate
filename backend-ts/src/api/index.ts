import express from 'express';

import githubRoutes from './github';
import sentryRoutes from './sentry';

const router = express.Router();

router.use('/sentry', sentryRoutes);
router.use('/github', githubRoutes);

export default router;
