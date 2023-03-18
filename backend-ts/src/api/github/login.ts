import axios from 'axios';
import express from 'express';

const router = express.Router();

router.get('/getAccessToken', async function (req, res) {
  console.log(req.query.code);
  const params = `?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${req.query.code}`;
  const response = await axios.post(
    `https://github.com/login/oauth/access_token${params}`,
    {
      headers: {
        Accept: 'application/json',
      },
    }
  );
  console.log(response.data);
  if (response.data && response.data.startsWith('access_token=')) {
    const data = response.data;
    const index = data.indexOf('&scope=&token_type=bearer');
    const accessToken = data.substring(13, index);
    const githubUserData = await getGithubUserData(`Bearer ${accessToken}`);
    console.log(githubUserData);
    res.status(200).json({
      access_token: accessToken,
      github_user_data: githubUserData,
    });
  } else {
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
