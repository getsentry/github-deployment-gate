import assert from 'assert';
import request from 'supertest';

import { createTestServer } from './testutils';

describe('GET /', () => {
  it('responds with a 200', async () => {
    const server = await createTestServer();
    const response = await request(server).get('/');
    assert.equal(response.statusCode, 200);
  });
});
