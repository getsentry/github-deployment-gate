import assert from 'assert';
import request from 'supertest';
import { Express } from 'express';

import { appConfig } from '../../../src/config';
import GithubRepo from '../../../src/models/GithubRepo.model';
import {
  MOCK_GITHUB_DEPLOY_REQUESTED,
  MOCK_GITHUB_REPO_ADDED,
  MOCK_GITHUB_REPO_CREATED,
  MOCK_GITHUB_REPO_DELETED,
  MOCK_GITHUB_REPO_REMOVED,
} from '../../mocks';

import { createTestServer } from '../../testutils';
import DeploymentProtectionRuleRequest from '../../../src/models/DeploymentProtectionRuleRequest.model';

const path = '/api/github/webhook/deploymentRule';

describe(`POST ${path}`, () => {
  let server: Express;

  beforeEach(async () => {
    server = await createTestServer();
  });

  it('responds with a 401 when deploymentRule webhook is called from anywhere else than Github', async () => {
    appConfig.isTestMode = false;
    const response = await request(server).post(path).send(MOCK_GITHUB_REPO_CREATED);
    assert.equal(response.statusCode, 401);
  });

  it('handles created action', async () => {
    appConfig.isTestMode = true;
    const response = await request(server).post(path).send(MOCK_GITHUB_REPO_CREATED);
    const repo = await GithubRepo.findOne({
      where: {
        name: MOCK_GITHUB_REPO_CREATED.repositories[0].full_name,
      },
    });
    if (repo) {
      assert.equal(repo.get().name, MOCK_GITHUB_REPO_CREATED.repositories[0].full_name);
    } else {
      assert.fail();
    }
  });

  it('handles added action', async () => {
    appConfig.isTestMode = true;
    const response = await request(server).post(path).send(MOCK_GITHUB_REPO_ADDED);
    const repo = await GithubRepo.findOne({
      where: {
        name: MOCK_GITHUB_REPO_ADDED.repositories_added[0].full_name,
      },
    });
    if (repo) {
      assert.equal(
        repo.get().name,
        MOCK_GITHUB_REPO_ADDED.repositories_added[0].full_name
      );
    } else {
      assert.fail();
    }
  });

  it('handles requested action', async () => {
    appConfig.isTestMode = true;
    const response = await request(server).post(path).send(MOCK_GITHUB_DEPLOY_REQUESTED);
    const deploymentProtectionRuleRequest = await DeploymentProtectionRuleRequest.findOne(
      {
        where: {
          deploymentCallbackUrl: MOCK_GITHUB_DEPLOY_REQUESTED.deployment_callback_url,
        },
      }
    );
    if (deploymentProtectionRuleRequest) {
      assert.equal(
        deploymentProtectionRuleRequest.get().installationId,
        MOCK_GITHUB_DEPLOY_REQUESTED.installation.id
      );
    } else {
      assert.fail();
    }
  });

  it('handles deleted action', async () => {
    appConfig.isTestMode = true;
    const response = await request(server).post(path).send(MOCK_GITHUB_REPO_CREATED);
    const repo = await GithubRepo.findOne({
      where: {
        name: MOCK_GITHUB_REPO_CREATED.repositories[0].full_name,
      },
    });
    if (repo) {
      assert.equal(repo.get().name, MOCK_GITHUB_REPO_CREATED.repositories[0].full_name);
      const deleteResponse = await request(server)
        .post(path)
        .send(MOCK_GITHUB_REPO_DELETED);
      assert.equal(deleteResponse.statusCode, 200);
      const deletedRepo = await GithubRepo.findOne({
        where: {
          name: MOCK_GITHUB_REPO_DELETED.repositories[0].full_name,
        },
      });
      if (deletedRepo) {
        assert.equal(deletedRepo.get().isActive, false);
      }
    } else {
      assert.fail();
    }
  });

  it('handles removed action', async () => {
    appConfig.isTestMode = true;
    const response = await request(server).post(path).send(MOCK_GITHUB_REPO_CREATED);
    const repo = await GithubRepo.findOne({
      where: {
        name: MOCK_GITHUB_REPO_CREATED.repositories[0].full_name,
      },
    });
    if (repo) {
      assert.equal(repo.get().name, MOCK_GITHUB_REPO_CREATED.repositories[0].full_name);
      const deleteResponse = await request(server)
        .post(path)
        .send(MOCK_GITHUB_REPO_REMOVED);
      assert.equal(deleteResponse.statusCode, 200);
      const deletedRepo = await GithubRepo.findOne({
        where: {
          name: MOCK_GITHUB_REPO_REMOVED.repositories_removed[0].full_name,
        },
      });
      if (deletedRepo) {
        assert.equal(deletedRepo.get().isActive, false);
      }
    } else {
      assert.fail();
    }
  });
});
