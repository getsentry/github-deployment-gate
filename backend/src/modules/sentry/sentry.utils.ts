import { OAuth2Client } from 'google-auth-library';
import { Op } from 'sequelize';

import DeploymentProtectionRuleRequest from '../../models/DeploymentProtectionRuleRequest.model';
import GithubRepo from '../../models/GithubRepo.model';
import SentryInstallation from '../../models/SentryInstallation.model';
import User from '../../models/User.model';
import {
  DeploymentProtectionRuleStatus,
  SentyReleaseResponseDTO,
} from '../../types/DeploymentRule.dto';
import { callGHPassFailAPI } from '../github/github.utils';
import { SentryAPIClient } from './api-client';

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
              DeploymentProtectionRuleStatus.REJECTED,
              `Found new issues in Sentry - https://${sentryInstallation.orgSlug}.sentry.io/releases/${releaseId}`
            );
          }
        }
      }
    }
  }
}

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

// This method will renew refresh tokens for all Sentry Intallations which are going to be expired in next one hour
export async function renewRefreshTokens() {
  const now = new Date();
  // Subtract 1 hour from current time
  now.setHours(now.getHours() + 1);
  const sentryInstallations = await SentryInstallation.findAll({
    where: {
      expiresAt: {
        [Op.lte]: now,
      },
    },
  });
  await Promise.all(
    sentryInstallations.map(sentryInstallation => {
      SentryAPIClient.renewSentryAPITokens(sentryInstallation.uuid);
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
        DeploymentProtectionRuleStatus.APPROVED,
        'No new issues'
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

export async function findOrUpdateInstallation(
  sentryInstallationUUID: string,
  userId: number
) {
  const installation = await SentryInstallation.findOne({
    where: { uuid: sentryInstallationUUID },
  });
  if (installation) {
    await installation.update({ userId });
  }
}

export async function verifyIDToken(token: string, url: string): Promise<boolean> {
  const oAuth2Client = new OAuth2Client(url);
  try {
    await oAuth2Client.verifyIdToken({
      idToken: token,
      audience: url,
    });
    return true;
  } catch (ex) {
    return false;
  }
}
