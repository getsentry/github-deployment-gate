import express from 'express';

import { verifyGithubSignature } from '../../middleware/github.middleware';
import ghWebhookRoutes from './webhook.routes';

export const ghRoutes = express.Router();

ghRoutes.use('/github/webhook', verifyGithubSignature, ghWebhookRoutes);
