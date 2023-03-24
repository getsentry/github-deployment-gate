import axios from 'axios';
import express from 'express';

import loginRoutes from './login';
import setupRoutes from './setup';
import webhookRoutes from './webhook';
import GithubRepo from '../../models/GithubRepo.model';
import SentryInstallation from '../../models/SentryInstallation.model';
import User from '../../models/User.model';
import {generateGHAppJWT} from '../../util/token.helpers';
import {
  DeploymentProtectionRuleStatus,
  RespondToGithubProtectionRuleDTO,
} from '../../dto/DeploymentRule.dto';
import {handleAxiosError} from '../../util/utils';
import DeploymentProtectionRuleRequest from '../../models/DeploymentProtectionRuleRequest.model';
import {callGHPassFailAPI} from '../sentry/setup';
import {verifyGithubSignature} from '../middleware';

const router = express.Router();

router.use('/login', loginRoutes);
router.use('/setup', setupRoutes);
router.use('/webhook', verifyGithubSignature, webhookRoutes);

router.get('/githubRepo', async function (req, res) {
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
  if (!req.query.githubHandle) {
    res.status(400).json({
      status: 'error',
      message: 'Bad request',
    });
    return;
  }
  try {
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
    const sentryInstallations = await SentryInstallation.findAll({
      where: {
        userId: user.id,
      },
    });
    if (sentryInstallations && sentryInstallations.length > 0) {
      res.status(200).json({
        status: 'success',
        data: sentryInstallations,
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.post('/deploymentgate', async (req, res) => {
  const {releaseId, status} = req.body;
  if (!status || !releaseId) {
    res.status(400).json({
      status: 'error',
      message: 'Please provide status and releaseId',
    });
    return;
  }
  try {
    if (
      status != DeploymentProtectionRuleStatus.APPROVED &&
      status != DeploymentProtectionRuleStatus.REJECTED
    ) {
      throw new Error('Invalid status');
    }
    const deploymentProtectionRuleRequest = await DeploymentProtectionRuleRequest.findOne(
      {
        where: {
          sha: releaseId,
          status: DeploymentProtectionRuleStatus.REQUESTED,
        },
      }
    );
    if (!deploymentProtectionRuleRequest) {
      throw new Error('Invalid releaseId');
    }

    await callGHPassFailAPI(
      deploymentProtectionRuleRequest.installationId,
      deploymentProtectionRuleRequest.deploymentCallbackUrl,
      deploymentProtectionRuleRequest.environment,
      status,
      `Manually ${status}`
    );
    res.status(200).json({
      status: 'success',
      message: `Manually ${status}`,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.get('/deployment/requests', async (req, res) => {
  const githubHandle = String(req.query.githubHandle);
  if (!githubHandle) {
    res.status(400).json({
      status: 'error',
      message: 'Please provide githubHandle',
    });
    return;
  }
  try {
    const user = await User.findOne({
      where: {
        githubHandle: githubHandle,
      },
    });
    if (!user) {
      throw new Error('Invalid githubHandle');
    }
    const githubRepos = await GithubRepo.findAll({
      where: {
        userId: user.id,
      },
    });
    if (!githubRepos || githubRepos.length === 0) {
      res.status(200).json({
        status: 'success',
        data: [],
      });
    }

    const deploymentRequests: Array<DeploymentProtectionRuleRequest> = [];
    for (let i = 0; i < githubRepos.length; i++) {
      const repo = githubRepos[i];
      const requests = await DeploymentProtectionRuleRequest.findAll({
        where: {
          githubRepoId: repo.id,
          status: DeploymentProtectionRuleStatus.REQUESTED,
        },
      });
      deploymentRequests.push(...requests);
    }

    res.status(200).json({
      status: 'success',
      data: deploymentRequests,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.post('/repo/waittime', async (req, res) => {
  const {repoId, waitTime} = req.body;
  if (!repoId || !waitTime) {
    res.status(400).json({
      status: 'error',
      message: 'Please provide repoId and waitTime',
    });
    return;
  }
  try {
    const githubRepo = await GithubRepo.findOne({
      where: {
        id: repoId,
      },
    });
    if (!githubRepo) {
      throw new Error('Invalid repoId');
    }
    await githubRepo.update({waitPeriodToCheckForIssue: waitTime});
    res.status(200).json({
      status: 'success',
      message: 'Wait time has been updated',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.get('/generate', async function (req, res) {
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
  const response = await axios
    .post(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      undefined,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
      }
    )
    .catch(function (error) {
      console.log('Error in getGithubInstallationAccessToken');
      handleAxiosError(error);
      throw new Error(error.message);
    });
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
  const response = await axios
    .post(deploymentCallbackUrl, respondToGithubProtectionRuleDTO, {
      headers: {
        Authorization: `Bearer ${installationAccessToken}`,
        Accept: 'application/vnd.github+json',
      },
    })
    .catch(function (error) {
      console.log('Error in respondToDeploymentProtectionRule');
      handleAxiosError(error);
    });
  return response;
}

export default router;
