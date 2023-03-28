import { config } from 'dotenv';
import path from 'path';

const isTestMode = process.env.NODE_ENV === 'test';

if (isTestMode) {
  config({ path: path.resolve(__dirname, '../../.env') });
} else {
  config();
}

const dbConfig = {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT ?? '5432'),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
};

const githubGateApp = {
  appId: process.env.GITHUB_APP_ID,
  webhookSecret: process.env.GITHUB_APP_WEBHOOK_SECRET,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
};

const githubOAuthApp = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
};

const sentry = {
  clientId: process.env.SENTRY_CLIENT_ID,
  clientSecret: process.env.SENTRY_CLIENT_SECRET,
  url: process.env.SENTRY_URL,
};

if (isTestMode) {
  dbConfig.host = '0.0.0.0';
  dbConfig.port = parseInt(process.env.TEST_DB_PORT ?? '5432');
}

export const appConfig = {
  db: dbConfig,
  githubOAuthApp,
  githubGateApp,
  sentry,
  isTestMode,
  port: process.env.PORT,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET ?? '',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET ?? '',
  deploymentRequestsHandler: process.env.DEPLOYMENT_REQUESTS_HANDLER ?? '',
  renewSentryTokensHandler: process.env.RENEW_SENTRY_TOKENS_HANDLER ?? '',
};
