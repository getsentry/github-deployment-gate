import express from 'express';
import GithubRepo from '../../models/GithubRepo.model';
import {DeploymentRuleAction, DeploymentRuleDTO} from '../../dto/DeploymentRule.dto';
import User from '../../models/User.model';

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
          GithubRepo.create({
            name: repo.full_name,
            userId: user.id,
            isActive: true,
          });
        }
      }
      break;
    case DeploymentRuleAction.REMOVED:
      if (deploymentRule.repositories_removed) {
        for (let i = 0; i < deploymentRule.repositories_removed.length; i++) {
          const repo = deploymentRule.repositories_removed[i];
          const user = await User.findOne({
            where: {githubHandle: deploymentRule.installation.account.login},
          });
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
      break;
  }
  res.json({
    status: 'success',
  });
});

export default router;
