import bodyParser from 'body-parser';
import express from 'express';

import { appConfig } from './config/index';
import { trpcMiddleware } from './middleware/trpc.middleware';
import { sequelize } from './models';
import { authRoutes } from './modules/auth/auth.routes';
import { ghRoutes } from './modules/github/github.routes';
import { sentryRoutes } from './modules/sentry/sentry.routes';

function createServer() {
  const server = express();
  server.use(
    bodyParser.json({
      verify: (req, res, buf) => {
        (<any>req).rawBody = buf;
      },
    })
  );
  server.use(express.json());
  server.get('/', (_req, res) => res.status(200).json({ success: true }));
  server.use('/api', authRoutes);
  server.use('/api/trpc', trpcMiddleware);
  server.use('/api', ghRoutes);
  server.use('/api', sentryRoutes);

  return server;
}

function start() {
  const port = appConfig.port;

  sequelize
    .authenticate()
    .then(() => sequelize.sync())
    .then(() => {
      const server = createServer();
      server.listen(port, () => {
        console.info('Server started on port', port);
      });
    })
    .catch(e => console.error(`[🔌 DB Connection Error]: ${e.message}`));
}

start();
