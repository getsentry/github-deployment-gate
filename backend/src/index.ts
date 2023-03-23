import 'dotenv/config';
import express from 'express';
import apiRoutes from './api';
import {sequelize} from './models';

function createServer() {
  const server = express();
  server.use(express.json());
  server.get('/', (_req, res) => res.sendStatus(200));
  server.use('/api', apiRoutes);
  return server;
}

function start() {
  const port = process.env.PORT;

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
