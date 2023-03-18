import axios from 'axios';
import express from 'express';

import SentryInstallation from '../../models/SentryInstallation.model';
import User from '../../models/User.model';

const router = express.Router();

router.get('/getAccessToken', async function (req, res) {
  const sentryInstallationUUID = req.query.sentryInstallationId;
  const tokenUrl = 'https://github.com/login/oauth/access_token';
  const data = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: req.query.code,
  };
  const headers = {
    Accept: 'application/json',
  };

  try {
    const response = await axios.post(tokenUrl, data, {headers});
    const {access_token, refresh_token} = response.data;
    console.log('Access token:', access_token);
    console.log('Refresh token:', refresh_token);
    if (access_token) {
      const githubUserData = await getGithubUserData(`Bearer ${access_token}`);
      console.log(githubUserData);
      // check if user already exists??

      const user = await User.findOne({
        where: {
          githubHandle: githubUserData.data.login,
        },
      });

      let sentryInstallationId = null;
      if (sentryInstallationUUID != 'null') {
        const installation = await SentryInstallation.findOne({
          where: {uuid: sentryInstallationUUID},
        });
        if (installation) {
          sentryInstallationId = installation.id;
        }
      }

      //If User already exists
      if (user) {
        if (sentryInstallationId) {
          await User.update(
            {sentryInstallationId: sentryInstallationId},
            {where: {githubHandle: githubUserData.data.login}}
          );
        }
      } else {
        await User.create({
          name: githubUserData.data.login,
          githubHandle: githubUserData.data.login,
          refreshToken: refresh_token,
          avatar: githubUserData.data.avatar_url,
          sentryInstallationId: sentryInstallationId,
        });
      }

      res.status(200).json({
        access_token: access_token,
        github_user_data: githubUserData,
      });
    } else {
      res.status(403).json({
        message: 'Invalid code',
      });
    }
  } catch (error) {
    console.error('Access Token Error', error.message);
    res.status(403).json({
      message: 'Invalid code',
    });
  }
});

router.get('/getUserData', async function (req, res) {
  console.log(req.get('Authorization'));
  const response = await getGithubUserData(req.get('Authorization'));
  console.log({response});
  res.json(response.data);
});

async function getGithubUserData(accessToken: string) {
  const response = await axios.get(`https://api.github.com/user`, {
    headers: {
      Authorization: accessToken,
      Accept: 'application/json',
    },
  });
  return {status: response.status, data: response.data};
}

export default router;
