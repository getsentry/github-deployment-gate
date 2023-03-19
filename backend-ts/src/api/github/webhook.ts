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
  console.log({deploymentRule});
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
    case DeploymentRuleAction.REQUESTED:
      if (deploymentRule.repository && deploymentRule.repository.full_name) {
        const githubRepo = await GithubRepo.findOne({
          where: {name: deploymentRule.repository.full_name},
        });
        DeploymentProtectionRuleRequest.create({
          status: DeploymentProtectionRuleStatus.REQUESTED,
          githubRepoId: githubRepo.id,
          installationId: deploymentRule.installation.id,
          deploymentCallbackUrl: deploymentRule.deployment_callback_url,
        });
      }
      break;
  }
  res.json({
    status: 'success',
  });
});

export default router;
