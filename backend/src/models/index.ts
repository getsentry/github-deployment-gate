import {config} from 'dotenv';
import path from 'path';
import {Sequelize} from 'sequelize-typescript';

import DeploymentProtectionRuleRequest from './DeploymentProtectionRuleRequest.model';
import GithubRepo from './GithubRepo.model';
import SentryInstallation from './SentryInstallation.model';
import User from './User.model';


config();

const {POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST, POSTGRES_PORT} =
  process.env;

const sequelizeConfig = {
  host: POSTGRES_HOST,
  port: parseInt(POSTGRES_PORT),
};

// We modify the Sequelize config to point to our test-database
if (process.env.NODE_ENV === 'test') {
  config({path: path.resolve(__dirname, '../../../.env')});
  sequelizeConfig.host = '127.0.0.1';
  sequelizeConfig.port = parseInt(process.env.TEST_DB_PORT);
}

// Connect our ORM to the database.
const sequelize = new Sequelize(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, {
  dialect: 'postgres',
  logging: false,
  models: [__dirname + '/**/*.model.ts'],
  ...sequelizeConfig,
});

sequelize.addModels([
  User,
  SentryInstallation,
  DeploymentProtectionRuleRequest,
  GithubRepo,
]);

export {sequelize};
