import axios from 'axios';
import express from 'express';

import loginRoutes from './login';
import setupRoutes from './setup';
import webhookRoutes from './webhook';
import GithubRepo from '../../models/GithubRepo.model';
import SentryInstallation from '../../models/SentryInstallation.model';
import User from '../../models/User.model';
import SentryAPIClient from '../../util/SentryAPIClient';
import {generateGHAppJWT} from '../../util/token.helpers';
import DeploymentProtectionRuleRequest from '../../models/DeploymentProtectionRuleRequest.model';
import {
  DeploymentProtectionRuleStatus,
  RespondToGithubProtectionRuleDTO,
} from '../../dto/DeploymentRule.dto';

const router = express.Router();

router.use('/login', loginRoutes);
router.use('/setup', setupRoutes);
router.use('/webhook', webhookRoutes);

router.get('/githubRepo', async function (req, res) {
  console.log(req.get('Authorization'));
  if (!req.query.githubHandle) {
    res.status(403).json({
      status: 'error',
      message: 'Unauthorized Access',
    });
    return;
  }
  const githubHandle = String(req.query.githubHandle);
  if (!req.get('Authorization')) {
    res.status(403).json({
      status: 'error',
      message: 'Unauthorized Access',
    });
    return;
  }

  const user = await getUserByGHHandle(githubHandle);
  if (!user) {
    res.status(404).json({
      status: 'error',
      message: 'No such user',
    });
    return;
  }
  const repos = await getGithubRepos(user.id);
  res.status(200).json({
    status: 'success',
    data: repos,
  });
});

router.get('/sentryInstallation', async function (req, res) {
  console.log(req.get('Authorization'));
  if (!req.query.githubHandle) {
    res.status(403).json({
      status: 'error',
      message: 'Unauthorized Access',
    });
    return;
  }
  const githubHandle = String(req.query.githubHandle);
  if (!req.get('Authorization')) {
    res.status(403).json({
      status: 'error',
      message: 'Unauthorized Access',
    });
    return;
  }

  const user = await getUserByGHHandle(githubHandle);
  if (!user) {
    res.status(404).json({
      status: 'error',
      message: 'No such user',
    });
    return;
  }
  const sentryInstallation = await SentryInstallation.findOne({
    where: {
      id: user.sentryInstallationId,
    },
  });
  let sentryData;
  if (sentryInstallation) {
    const sentry = await SentryAPIClient.create(sentryInstallation.uuid);
    sentryData = await sentry.get(
      `/organizations/${sentryInstallation.orgSlug}/projects/`
    );
    res.status(200).json({
      status: 'success',
      data: {
        id: sentryInstallation.id,
        uuid: sentryInstallation.uuid,
        orgSlug: sentryInstallation.orgSlug,
        token: sentryInstallation.token,
        expiresAt: sentryInstallation.expiresAt,
        projectSlugs: sentryData
          ? sentryData.data.map((s: {slug: string}) => s.slug)
          : [],
      },
    });
  } else {
    res.status(200).json({
      status: 'success',
      data: null,
    });
  }
});

router.get('/generate', async function (req, res) {
  console.log(req.get('generate'));
  const token = await generateGHAppJWT();
  // const token = await getGithubAccessToken();
  res.status(200).json({
    status: 'success',
    data: {
      token: token,
    },
  });
});

async function getUserByGHHandle(githubHandle: string) {
  const user = await User.findOne({
    where: {
      githubHandle: githubHandle,
    },
  });
  return user;
}

async function getGithubRepos(userId: string) {
  const repos = await GithubRepo.findAll({
    where: {
      userId: userId,
      isActive: true,
    },
  });
  return repos;
}

export async function getGithubInstallationAccessToken(
  installationId: number,
  accessToken: string
) {
  const response = await axios.post(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    undefined,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
    }
  );
  if (response && response.data) {
    return response.data.token;
  }
  return null;
}

export async function respondToDeploymentProtectionRule(
  deploymentCallbackUrl: string,
  installationAccessToken: string,
  respondToGithubProtectionRuleDTO: RespondToGithubProtectionRuleDTO
) {
  const response = await axios.post(
    deploymentCallbackUrl,
    respondToGithubProtectionRuleDTO,
    {
      headers: {
        Authorization: `Bearer ${installationAccessToken}`,
        Accept: 'application/vnd.github+json',
      },
    }
  );
  console.log('response', response);
  console.log('response.data', response.data);
  console.log('response.status', response.status);
  return response;
}

export default router;
