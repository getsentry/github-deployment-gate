import express from 'express';

import loginRoutes from './login';
import GithubRepo from '../../models/GithubRepo.model';
import SentryInstallation from '../../models/SentryInstallation.model';
import User from '../../models/User.model';
import SentryAPIClient from '../../util/SentryAPIClient';

const router = express.Router();

router.use('/login', loginRoutes);

router.get('/githubRepo', async function (req, res) {
  console.log(req.get('Authorization'));
  if (!req.query.githubHandle) {
    res.status(403).json({
      status: 'error',
      message: 'Unauthorized Access',
    });
    return;
  }
  const githubHandle = String(req.query.githubHandle);
  if (!req.get('Authorization')) {
    res.status(403).json({
      status: 'error',
      message: 'Unauthorized Access',
    });
    return;
  }

  const user = await getUserByGHHandle(githubHandle);
  if (!user) {
    res.status(404).json({
      status: 'error',
      message: 'No such user',
    });
    return;
  }
  const repos = await getGithubRepos(user.id);
  res.status(200).json({
    status: 'success',
    data: repos,
  });
});

router.get('/sentryInstallation', async function (req, res) {
  console.log(req.get('Authorization'));
  if (!req.query.githubHandle) {
    res.status(403).json({
      status: 'error',
      message: 'Unauthorized Access',
    });
    return;
  }
  const githubHandle = String(req.query.githubHandle);
  if (!req.get('Authorization')) {
    res.status(403).json({
      status: 'error',
      message: 'Unauthorized Access',
    });
    return;
  }

  const user = await getUserByGHHandle(githubHandle);
  if (!user) {
    res.status(404).json({
      status: 'error',
      message: 'No such user',
    });
    return;
  }
  const sentryInstallation = await SentryInstallation.findOne({
    where: {
      id: user.sentryInstallationId,
    },
  });
  let sentryData;
  if (sentryInstallation) {
    const sentry = await SentryAPIClient.create(sentryInstallation.uuid);
    sentryData = await sentry.get(
      `/organizations/${sentryInstallation.orgSlug}/projects/`
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      id: sentryInstallation.id,
      uuid: sentryInstallation.uuid,
      orgSlug: sentryInstallation.orgSlug,
      token: sentryInstallation.token,
      expiresAt: sentryInstallation.expiresAt,
      projectSlugs: sentryData ? sentryData.data.map((s: {slug: string}) => s.slug) : [],
    },
  });
});
``;
async function getUserByGHHandle(githubHandle: string) {
  const user = await User.findOne({
    where: {
      githubHandle: githubHandle,
    },
  });
  return user;
}

async function getGithubRepos(userId: string) {
  const repos = await GithubRepo.findAll({
    where: {
      userId: userId,
    },
  });
  return repos;
}

export default router;
