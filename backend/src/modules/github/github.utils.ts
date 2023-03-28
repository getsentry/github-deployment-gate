import axios from 'axios';
import { InferAttributes } from 'sequelize';
import { App } from 'octokit';
import * as jwt from 'jsonwebtoken';

import { appConfig } from '../../config';
import DeploymentProtectionRuleRequest from '../../models/DeploymentProtectionRuleRequest.model';
import GithubRepo from '../../models/GithubRepo.model';
import User from '../../models/User.model';
import {
  DeploymentProtectionRuleStatus,
  RespondToGithubProtectionRuleDTO,
} from '../../types/DeploymentRule.dto';
import { handleAxiosError } from '../../utils/axios';

export async function getUserByGHHandle(githubHandle: string) {
  const user = await User.findOne({
    where: {
      githubHandle: githubHandle,
    },
  }).then(user => user?.get() as InferAttributes<User>);
  return user;
}

export async function getGithubRepos(userId: number) {
  const repos = await GithubRepo.findAll({
    where: {
      userId,
      isActive: true,
    },
  });
  return repos.map<InferAttributes<GithubRepo>>(repo => repo.get());
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

export async function callGHPassFailAPI(
  installationId: number,
  deploymentCallbackUrl: string,
  environment: string,
  status: DeploymentProtectionRuleStatus,
  comment: string
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
        comment: comment,
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

export async function generateGHAppJWT() {
  const payload = {
    // Set the payload data here
    iss: appConfig.githubGateApp.appId,
  };

  const secretKey = appConfig.githubGateApp.privateKey;
  if (!secretKey) {
    throw new Error('No private key found for GitHub App');
  }
  const token = jwt.sign(payload, secretKey, { algorithm: 'RS256', expiresIn: '10m' });

  return token;
}

export async function getGithubAccessToken() {
  if (!appConfig.githubGateApp?.appId) {
    throw new Error('No GitHub App ID found');
  }
  if (!appConfig.githubGateApp?.privateKey) {
    throw new Error('No private key found for GitHub App');
  }
  const app = new App({
    appId: appConfig.githubGateApp.appId,
    privateKey: appConfig.githubGateApp.privateKey,
  });
  const token = await app.octokit.request('/app');
  return token;
}
