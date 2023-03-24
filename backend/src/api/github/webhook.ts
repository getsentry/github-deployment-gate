import express from 'express';
import GithubRepo from '../../models/GithubRepo.model';
import {
  DeploymentProtectionRuleStatus,
  DeploymentRuleAction,
  DeploymentRuleDTO,
} from '../../dto/DeploymentRule.dto';
import User from '../../models/User.model';
import DeploymentProtectionRuleRequest from '../../models/DeploymentProtectionRuleRequest.model';

const router = express.Router();

router.post('/deploymentRule', async function (req, res) {
  console.log('deploymentRule');
  const deploymentRule: DeploymentRuleDTO = req.body;
  switch (deploymentRule.action) {
    case DeploymentRuleAction.ADDED:
      if (deploymentRule.repositories_added) {
        for (let i = 0; i < deploymentRule.repositories_added.length; i++) {
          const repo = deploymentRule.repositories_added[i];
          const user = await User.findOne({
            where: {githubHandle: deploymentRule.installation.account.login},
          });
          const githubRepo = await GithubRepo.findOne({
            where: {name: repo.full_name},
          });
          if (!githubRepo) {
            GithubRepo.create({
              name: repo.full_name,
              waitPeriodToCheckForIssue: 900,
              userId: user.id,
              isActive: true,
            });
          } else {
            githubRepo.update({isActive: true});
          }
        }
      }
      break;
    case DeploymentRuleAction.CREATED:
      if (deploymentRule.repositories) {
        let user = await User.findOne({
          where: {githubHandle: deploymentRule.installation.account.login},
        });
        if (!user) {
          user = await User.create({
            name: deploymentRule.installation.account.login,
            githubHandle: deploymentRule.installation.account.login,
            avatar: deploymentRule.installation.account.login,
          });
        }
        for (let i = 0; i < deploymentRule.repositories.length; i++) {
          const repo = deploymentRule.repositories[i];
          const githubRepo = await GithubRepo.findOne({
            where: {name: repo.full_name},
          });
          if (!githubRepo) {
            GithubRepo.create({
              name: repo.full_name,
              waitPeriodToCheckForIssue: 900,
              userId: user.id,
              isActive: true,
            });
          } else {
            githubRepo.update({isActive: true});
          }
        }
      }
      break;
    case DeploymentRuleAction.REMOVED:
      if (deploymentRule.repositories_removed) {
        for (let i = 0; i < deploymentRule.repositories_removed.length; i++) {
          const repo = deploymentRule.repositories_removed[i];
          const githubRepo = await GithubRepo.findOne({
            where: {name: repo.full_name},
          });
          if (githubRepo) {
            githubRepo.update({
              isActive: false,
            });
          }
        }
      }
      break;
    case DeploymentRuleAction.DELETED:
      if (deploymentRule.repositories) {
        for (let i = 0; i < deploymentRule.repositories.length; i++) {
          const repo = deploymentRule.repositories[i];
          const githubRepo = await GithubRepo.findOne({
            where: {name: repo.full_name},
          });
          if (githubRepo) {
            githubRepo.update({
              isActive: false,
            });
          }
        }
      }
      break;
    case DeploymentRuleAction.REQUESTED:
      if (deploymentRule.repository && deploymentRule.repository.full_name) {
        let githubRepo = await GithubRepo.findOne({
          where: {name: deploymentRule.repository.full_name},
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

export default router;
