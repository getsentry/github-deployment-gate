import express from 'express';

import SentryAPIClient from '../../util/SentryAPIClient';
import SentryInstallation from '../../models/SentryInstallation.model';

const router = express.Router();

router.get('/', async (request, response) => {
  const sentry = await SentryAPIClient.create('');
});

export default router;
