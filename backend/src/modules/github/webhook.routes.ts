import express from 'express';

import DeploymentProtectionRuleRequest from '../../models/DeploymentProtectionRuleRequest.model';
import GithubRepo from '../../models/GithubRepo.model';
import User from '../../models/User.model';
import {
  DeploymentProtectionRuleStatus,
  DeploymentRuleAction,
  DeploymentRuleDTO,
} from '../../types/DeploymentRule.dto';

const ghWebhookRoutes = express.Router();

ghWebhookRoutes.post('/deploymentRule', async function (req, res) {
  console.log('deploymentRule');
  const deploymentRule: DeploymentRuleDTO = req.body;
  switch (deploymentRule.action) {
    case DeploymentRuleAction.ADDED:
      if (deploymentRule.repositories_added) {
        let user = await User.findOne({
          where: { githubHandle: deploymentRule.sender.login },
        });
        if (!user) {
          user = await User.create({
            name: deploymentRule.sender.login,
            githubHandle: deploymentRule.sender.login,
            avatar: deploymentRule.installation.account.avatar_url,
          });
        }
        await Promise.all(
          deploymentRule.repositories_added.map(async repo => {
            const githubRepo = await GithubRepo.findOne({
              where: { name: repo.full_name },
            });
            if (!githubRepo) {
              GithubRepo.create({
                name: repo.full_name,
                waitPeriodToCheckForIssue: 900,
                userId: user.id,
                isActive: true,
              });
            } else {
              githubRepo.update({ isActive: true, userId: user.id });
            }
          })
        );
      }
      break;
    case DeploymentRuleAction.CREATED:
      if (deploymentRule.repositories) {
        let user = await User.findOne({
          where: { githubHandle: deploymentRule.sender.login },
        });
        if (!user) {
          user = await User.create({
            name: deploymentRule.sender.login,
            githubHandle: deploymentRule.sender.login,
            avatar: deploymentRule.installation.account.avatar_url,
          });
        }

        await Promise.all(
          deploymentRule.repositories.map(async repo => {
            const githubRepo = await GithubRepo.findOne({
              where: { name: repo.full_name },
            });
            if (!githubRepo) {
              GithubRepo.create({
                name: repo.full_name,
                waitPeriodToCheckForIssue: 900,
                userId: user.id,
                isActive: true,
              });
            } else {
              githubRepo.update({ isActive: true, userId: user.id });
            }
          })
        );
      }
      break;
    case DeploymentRuleAction.REMOVED:
      if (deploymentRule.repositories_removed) {
        await Promise.all(
          deploymentRule.repositories_removed.map(async repo => {
            const githubRepo = await GithubRepo.findOne({
              where: { name: repo.full_name },
            });
            if (githubRepo) {
              githubRepo.update({
                isActive: false,
              });
            }
          })
        );
      }
      break;
    case DeploymentRuleAction.DELETED:
      if (deploymentRule.repositories) {
        await Promise.all(
          deploymentRule.repositories.map(async repo => {
            const githubRepo = await GithubRepo.findOne({
              where: { name: repo.full_name },
            });
            if (githubRepo) {
              githubRepo.update({
                isActive: false,
              });
            }
          })
        );
      }
      break;
    case DeploymentRuleAction.REQUESTED:
      if (deploymentRule.repository && deploymentRule.repository.full_name) {
        let githubRepo = await GithubRepo.findOne({
          where: { name: deploymentRule.repository.full_name },
        });
        // If a request came, the repo for which never added to our system. This may only happen due to some glitch.
        if (!githubRepo) {
          // Find if the owner of the repo is existing user of the system, if not create a user for the owner
          let owner = await User.findOne({
            where: {
              githubHandle: deploymentRule.repository.owner.login,
            },
          });
          if (!owner) {
            owner = await User.create({
              name: deploymentRule.repository.owner.login,
              githubHandle: deploymentRule.repository.owner.login,
              avatar: deploymentRule.repository.owner.avatar_url,
            });
          }

          // create entry for github repo
          githubRepo = await GithubRepo.create({
            name: deploymentRule.repository.full_name,
            waitPeriodToCheckForIssue: 900,
            userId: owner.id,
            isActive: true,
          });
        }

        DeploymentProtectionRuleRequest.create({
          status: DeploymentProtectionRuleStatus.REQUESTED,
          githubRepoId: githubRepo.id,
          installationId: deploymentRule.installation.id,
          environment: deploymentRule.environment,
          deploymentCallbackUrl: deploymentRule.deployment_callback_url,
          sha: deploymentRule.deployment.sha,
          createdAt: new Date(),
        });
      }
      break;
  }
  res.json({
    status: 'success',
  });
});

export default ghWebhookRoutes;
