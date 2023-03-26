import axios from 'axios';
import express from 'express';

import { appConfig } from '../../config';
import SentryInstallation from '../../models/SentryInstallation.model';
import { InstallResponseData, TokenResponseData } from './sentry.types';
import { processDeploymentRules, verifyIDToken } from './sentry.utils';

export const sentryOpenRoutes = express.Router();

sentryOpenRoutes.post('/setup', async (req, res) => {
  console.log('Redirect URL - Setup');
  // Destructure the all the body params we receive from the installation prompt
  const { code, installationId, sentryOrgSlug } = req.body;
  if (!code || !installationId) {
    res.status(403).json({
      status: 'error',
      message: 'Invalid code or installationId',
    });
    return;
  }

  // Construct a payload to ask Sentry for a token on the basis that a user is installing
  const payload = {
    grant_type: 'authorization_code',
    code,
    client_id: appConfig.sentry.clientId,
    client_secret: appConfig.sentry.clientSecret,
  };

  try {
    // Send that payload to Sentry and parse its response
    const tokenResponse: { data: TokenResponseData } = await axios.post(
      `${appConfig.sentry.url}/api/0/sentry-app-installations/${installationId}/authorizations/`,
      payload
    );

    // Store the tokenData (i.e. token, refreshToken, expiresAt) for future requests
    //    - Make sure to associate the installationId and the tokenData since it's unique to the organization
    //    - Using the wrong token for the a different installation will result 401 Unauthorized responses
    const { token, refreshToken, expiresAt } = tokenResponse.data;
    console.log('Creating SentryInstallation');
    await SentryInstallation.create({
      uuid: installationId as string,
      orgSlug: sentryOrgSlug as string,
      expiresAt: new Date(expiresAt),
      token,
      refreshToken,
      createdAt: new Date(),
    });
    console.log('Created SentryInstallation');

    // Verify the installation to inform Sentry of the success
    //    - This step is only required if you have enabled 'Verify Installation' on your integration
    const verifyResponse: { data: InstallResponseData } = await axios.put(
      `${appConfig.sentry.url}/api/0/sentry-app-installations/${installationId}/`,
      { status: 'installed' },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Continue the installation process
    // - If your app requires additional configuration, this is where you can do it
    // - The token/refreshToken can be used to make requests to Sentry's API
    // - Once you're done, you can optionally redirect the user back to Sentry as we do below
    console.info(`Installed ${verifyResponse.data.app.slug}'`);
    res.status(201).send({
      status: 'success',
      redirectUrl: `${appConfig.sentry.url}/settings/${sentryOrgSlug}/sentry-apps/${verifyResponse.data.app.slug}/`,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

sentryOpenRoutes.post('/deployment-requests-handler', async (req, res) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    res.status(403).json({});
    return;
  }
  const isValid = await verifyIDToken(idToken);
  if (!isValid) {
    res.status(403).json({});
    return;
  }
  processDeploymentRules();
  res.status(200).json({
    status: 'success',
  });
});
