import { Sequelize } from 'sequelize-typescript';
import { newDb } from 'pg-mem';

import { createServer } from '../src/index';
import DeploymentProtectionRuleRequest from '../src/models/DeploymentProtectionRuleRequest.model';
import GithubRepo from '../src/models/GithubRepo.model';
import SentryInstallation from '../src/models/SentryInstallation.model';
import User from '../src/models/User.model';

export const createTestServer = async () => {
  const db = newDb();
  const sequelize = new Sequelize({
    dialect: 'postgres',
    dialectModule: db.adapters.createPg(),
  });

  sequelize.addModels([
    User,
    SentryInstallation,
    DeploymentProtectionRuleRequest,
    GithubRepo,
  ]);

  await sequelize.sync({ force: true });
  return createServer();
};
