import { Sequelize } from 'sequelize-typescript';

import { appConfig } from '../config';
import DeploymentProtectionRuleRequest from './DeploymentProtectionRuleRequest.model';
import GithubRepo from './GithubRepo.model';
import SentryInstallation from './SentryInstallation.model';
import User from './User.model';

// Connect our ORM to the database.
const sequelize = new Sequelize(
  appConfig.db.database,
  appConfig.db.username,
  appConfig.db.password,
  {
    dialect: 'postgres',
    logging: false,
    models: [__dirname + '/**/*.model.ts'],
    host: appConfig.db.host,
    port: appConfig.db.port,
  }
);

sequelize.addModels([
  User,
  SentryInstallation,
  DeploymentProtectionRuleRequest,
  GithubRepo,
]);

export { sequelize };
