import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import bodyParser from 'body-parser';
import express from 'express';

import { appConfig } from './config/index';
import { trpcMiddleware } from './middleware/trpc.middleware';
import { sequelize } from './models';
import { authRoutes } from './modules/auth/auth.routes';
import { ghRoutes } from './modules/github/github.routes';
import { sentryRoutes } from './modules/sentry/sentry.routes';
import path from 'path';

export function createServer() {
  const server = express();

  Sentry.init({
    dsn: 'https://8a019ebce68042ea9b79c819fb2de429@o1.ingest.sentry.io/4504922584317952',
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app: server }),
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  server.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  server.use(Sentry.Handlers.tracingHandler());

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
  server.use('/health', function (_req, res) {
    res.status(200).json({ status: 'ok' });
  });
  server.use(Sentry.Handlers.errorHandler());
  server.use(express.static(path.join(__dirname, 'public')));
  server.get('/*', (_req, res) => {
    res.sendFile(__dirname + '/public/index.html');
  });

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
