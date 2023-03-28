import assert from 'assert';
import request from 'supertest';
import { Express } from 'express';

import { appConfig } from '../../../src/config';

import { createTestServer } from '../../testutils';

const path = '/api/sentry/deployment-requests-handler';

describe(`POST ${path}`, () => {
  let server: Express;

  beforeEach(async () => {
    server = await createTestServer();
  });

  it('responds with a 403 when deployment-requests-handler webhook is called without OIDC token', async () => {
    const response = await request(server).post(path);
    assert.equal(response.statusCode, 403);
  });
});
