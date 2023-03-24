import axios from 'axios';
import express from 'express';
import SentryAPIClient from '../../util/SentryAPIClient';
import {
  DeploymentProtectionRuleStatus,
  SentyReleaseResponseDTO,
} from '../../dto/DeploymentRule.dto';
import DeploymentProtectionRuleRequest from '../../models/DeploymentProtectionRuleRequest.model';

import SentryInstallation from '../../models/SentryInstallation.model';
import GithubRepo from '../../models/GithubRepo.model';
import User from '../../models/User.model';
import {generateGHAppJWT, getGithubAccessToken} from '../../util/token.helpers';
import {
  getGithubInstallationAccessToken,
  respondToDeploymentProtectionRule,
} from '../github';
import {handleAxiosError} from '../../util/utils';

export type TokenResponseData = {
  expiresAt: string; // ISO date string at which token must be refreshed
  token: string; // Bearer token authorized to make Sentry API requests
  refreshToken: string; // Refresh token required to get a new Bearer token after expiration
};

export type InstallResponseData = {
  app: {
    uuid: string; // UUID for your application (shared across installations)
    slug: string; // URL slug for your application (shared across installations)
  };
  organization: {
    slug: string; // URL slug for the organization doing the installation
  };
  uuid: string; // UUID for the individual installation
};

const router = express.Router();

router.post('/', async (req, res) => {
  console.log('Redirect URL - Setup');
  // Destructure the all the body params we receive from the installation prompt
  const {code, installationId, sentryOrgSlug} = req.body;
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
    client_id: process.env.SENTRY_CLIENT_ID,
    client_secret: process.env.SENTRY_CLIENT_SECRET,
  };

  try {
    // Send that payload to Sentry and parse its response
    const tokenResponse: {data: TokenResponseData} = await axios.post(
      `${process.env.SENTRY_URL}/api/0/sentry-app-installations/${installationId}/authorizations/`,
      payload
    );

    // Store the tokenData (i.e. token, refreshToken, expiresAt) for future requests
    //    - Make sure to associate the installationId and the tokenData since it's unique to the organization
    //    - Using the wrong token for the a different installation will result 401 Unauthorized responses
    const {token, refreshToken, expiresAt} = tokenResponse.data;
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
    const verifyResponse: {data: InstallResponseData} = await axios.put(
      `${process.env.SENTRY_URL}/api/0/sentry-app-installations/${installationId}/`,
      {status: 'installed'},
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
      redirectUrl: `${process.env.SENTRY_URL}/settings/${sentryOrgSlug}/sentry-apps/${verifyResponse.data.app.slug}/`,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.post('/process', async (req, res) => {
  console.log('process');
  processDeploymentRules();
  res.status(200).json({
    status: 'success',
  });
});

export async function processDeploymentRules() {
  // Find all deployment protection rules request which are in requested state
  const requests = await DeploymentProtectionRuleRequest.findAll({
    where: {
      status: DeploymentProtectionRuleStatus.REQUESTED,
    },
  });

  await Promise.all(
    requests.map(request => {
      processDeploymentProtectionRuleRequest(request);
    })
  );
}

export async function processDeploymentProtectionRuleRequest(
  request: DeploymentProtectionRuleRequest
) {
  // If request created time is more than wait time ago, then call GH api with approved status
  const now = new Date();
  const diffInMs = Math.abs(now.getTime() - request.createdAt.getTime());
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const githubRepo = await GithubRepo.findOne({
    where: {
      id: request.githubRepoId,
    },
  });
  if (githubRepo) {
    if (diffInSeconds > githubRepo.waitPeriodToCheckForIssue) {
      // Call GH api with approved response
      await callGHPassFailAPI(
        request.installationId,
        request.deploymentCallbackUrl,
        request.environment,
        DeploymentProtectionRuleStatus.APPROVED
      );
    } else {
      // Else call the method to find for new issues for a particular release and call GH api with rejected status
      checkForNewIssue(
        request.sha,
        request.githubRepoId,
        request.installationId,
        request.deploymentCallbackUrl,
        request.environment
      );
    }
  }
}

export async function checkForNewIssue(
  releaseId: string,
  githubRepoId: number,
  installationId: number,
  deploymentCallbackUrl: string,
  environment: string
) {
  console.log('checkForNewIssue');
  const githubRepo = await GithubRepo.findOne({
    where: {
      id: githubRepoId,
    },
  });
  if (githubRepo) {
    const user = await User.findOne({
      where: {
        id: githubRepo.userId,
      },
    });
    if (user) {
      const sentryInstallations = await SentryInstallation.findAll({
        where: {
          userId: user.id,
        },
        order: [['createdAt', 'DESC']],
      });
      if (sentryInstallations && sentryInstallations.length > 0) {
        // The below line can be replaced by the logic which finds out which sentry installation/org_slug is mapped to the github repo in discussion
        const sentryInstallation = sentryInstallations[0];

        const sentry = await SentryAPIClient.create(sentryInstallation.uuid);
        const response = await sentry.get(
          `/organizations/${sentryInstallation.orgSlug}/releases/${releaseId}/`
        );
        if (response) {
          const sentryReleaseResponse: SentyReleaseResponseDTO = response.data;
          console.log('sentryReleaseResponse.newGroups', sentryReleaseResponse.newGroups);
          if (sentryReleaseResponse && sentryReleaseResponse.newGroups) {
            // Call GH api with rejected response
            await callGHPassFailAPI(
              installationId,
              deploymentCallbackUrl,
              environment,
              DeploymentProtectionRuleStatus.REJECTED
            );
          }
        }
      }
    }
  }
}

export async function callGHPassFailAPI(
  installationId: number,
  deploymentCallbackUrl: string,
  environment: string,
  status: DeploymentProtectionRuleStatus,
  comment?: string
) {
  const jwtToken = await generateGHAppJWT();
  const installationToken = await getGithubInstallationAccessToken(
    installationId,
    jwtToken
  );
  console.log('installationToken', installationToken);
  if (installationToken) {
    const apiResponse = await respondToDeploymentProtectionRule(
      deploymentCallbackUrl,
      installationToken,
      {
        state: status,
        comment: comment
          ? comment
          : status === DeploymentProtectionRuleStatus.REJECTED
          ? 'Found new issues in Sentry '
          : 'No new issues',
        environment_name: environment,
      }
    );
    if (apiResponse && apiResponse.status == 204) {
      const deploymentProtectionRuleRequest =
        await DeploymentProtectionRuleRequest.findOne({
          where: {
            deploymentCallbackUrl: deploymentCallbackUrl,
          },
        });
      if (deploymentProtectionRuleRequest) {
        deploymentProtectionRuleRequest.update({
          status: status,
        });
      }
    }
  }
}

export default router;
