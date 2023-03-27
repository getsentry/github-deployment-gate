import { decode, sign, verify } from 'jsonwebtoken';
import { InferAttributes } from 'sequelize';

import { appConfig } from '../../config';
import User from '../../models/User.model';
import { AccessTokenPayload, RefreshTokenPayload } from '../../types/auth-token';

const REFRESH_TOKEN_LIFETIME = '7 days';
const ACCESS_TOKEN_LIFETIME = '10 min';

export async function createAccessToken(user: InferAttributes<User>): Promise<string> {
  const tokenPayload: AccessTokenPayload = {
    sub: user.githubHandle,
    data: {
      id: user.id,
      name: user.name,
      githubHandle: user.githubHandle,
    },
  };
  return new Promise((resolve, reject) =>
    sign(
      tokenPayload,
      appConfig.accessTokenSecret,
      {
        expiresIn: ACCESS_TOKEN_LIFETIME,
      },
      (err, token) => {
        if (err) {
          return reject(err);
        }
        resolve(token);
      }
    )
  );
}

export async function createRefreshToken(user: User): Promise<string> {
  const tokenPayload: AccessTokenPayload = {
    sub: user.githubHandle,
    data: {
      id: user.id,
      name: user.name,
      githubHandle: user.githubHandle,
    },
  };
  return new Promise((resolve, reject) =>
    sign(
      tokenPayload,
      appConfig.refreshTokenSecret,
      {
        expiresIn: REFRESH_TOKEN_LIFETIME,
      },
      (err, token) => {
        if (err) {
          return reject(err);
        }
        resolve(token);
      }
    )
  );
}

export async function verifyAccessToken(
  accessToken: string,
  username: string,
  { ignoreExpiration }: { ignoreExpiration?: boolean }
): Promise<AccessTokenPayload> {
  return new Promise((resolve, reject) =>
    verify(
      accessToken,
      appConfig.accessTokenSecret,
      {
        subject: username,
        ignoreExpiration: ignoreExpiration === true,
      },
      (err, payload: any) => {
        if (err) {
          return reject(err);
        }
        resolve(payload.data as AccessTokenPayload);
      }
    )
  );
}

export async function verifyRefreshToken(
  refreshToken: string,
  username: string
): Promise<RefreshTokenPayload> {
  return new Promise((resolve, reject) =>
    verify(
      refreshToken,
      appConfig.refreshTokenSecret,
      {
        subject: username,
      },
      (err, payload: any) => {
        if (err) {
          return reject(err);
        }
        resolve(payload.data as RefreshTokenPayload);
      }
    )
  );
}

export function decodeToken(token: string) {
  return decode(token, {
    complete: true,
    json: true,
  });
}
