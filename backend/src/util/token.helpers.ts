import * as jwt from 'jsonwebtoken';
import {App} from 'octokit';

const extractToken = (req: any) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
};

const verifyAccessToken = (accessToken: string) => {
  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
  return jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
};

export async function generateGHAppJWT() {
  const payload = {
    // Set the payload data here
    iss: process.env.GITHUB_APP_ID,
  };

  const secretKey = process.env.GITHUB_APP_PRIVATE_KEY; // Set your secret key here
  const token = jwt.sign(payload, secretKey, {algorithm: 'RS256', expiresIn: '10m'});

  return token;
}

export async function getGithubAccessToken() {
  const app = new App({
    appId: process.env.GITHUB_APP_ID,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
  });
  const token = await app.octokit.request('/app');
  return token;
}

export {extractToken, verifyAccessToken};
