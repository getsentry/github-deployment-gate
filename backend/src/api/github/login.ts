import axios from 'axios';
import express from 'express';
import {handleAxiosError} from '../../util/utils';

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
    if (access_token) {
      const githubUserData = await getGithubUserData(`Bearer ${access_token}`);
      // check if user already exists??

      let user = await User.findOne({
        where: {
          githubHandle: githubUserData.data.login,
        },
      });

      //If User does not already exists
      if (!user) {
        user = await User.create({
          name: githubUserData.data.login,
          githubHandle: githubUserData.data.login,
          refreshToken: refresh_token,
          avatar: githubUserData.data.avatar_url,
        });
      }

      if (sentryInstallationUUID != 'null') {
        const installation = await SentryInstallation.findOne({
          where: {uuid: sentryInstallationUUID},
        });
        if (installation) {
          await installation.update({userId: user.id});
        }
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
      message: error.message,
    });
  }
});

router.get('/getUserData', async function (req, res) {
  try {
    const response = await getGithubUserData(req.get('Authorization'));
    res.json(response.data);
  } catch (error) {
    res.status(403).json({
      message: error.message,
    });
  }
});

async function getGithubUserData(accessToken: string) {
  const response = await axios
    .get(`https://api.github.com/user`, {
      headers: {
        Authorization: accessToken,
        Accept: 'application/json',
      },
    })
    .catch(function (error) {
      console.log('Error in getGithubUserData');
      handleAxiosError(error);
      throw new Error(error.message);
    });
  return {status: response.status, data: response.data};
}

export default router;
