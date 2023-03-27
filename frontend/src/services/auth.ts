import dayjs from 'dayjs';
import { decodeJwt } from 'jose';

import type {
  AccessTokenPayload,
  IRenewTokenPayload,
  ISigninResponse,
  RefreshTokenPayload,
} from '../types';
import { clearAuthTokens, loadAuthTokens, saveAuthTokens } from './authTokenStorage';
import { axiosAuthInstance } from './axiosInstances';
import { loadSentryInstallationId } from './sentryStorage';

export async function verifyOAuthCode(code: string): Promise<ISigninResponse> {
  const sentryInstallationId = loadSentryInstallationId();

  const response = await axiosAuthInstance
    .get<ISigninResponse>('gh-callback', {
      params: {
        code,
        sentryInstallationId,
      },
    })
    .then((resp) => resp.data);

  if (!response.accessToken || !response.refreshToken) {
    throw new Error('Signin failed');
  }

  saveAuthTokens({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });

  return response;
}

export async function renewAccessToken(payload: IRenewTokenPayload): Promise<string> {
  try {
    return axiosAuthInstance
      .post<{ accessToken: string }>('renew-access-token', payload)
      .then((resp) => resp.data.accessToken);
  } catch {
    throw new Error('Error renewing access token');
  }
}

export async function getAuthInfo({
  retry,
}: {
  retry: boolean;
}): Promise<null | (AccessTokenPayload['data'] & { accessToken: string })> {
  const tokens = loadAuthTokens();
  if (!tokens) {
    return null;
  }
  const payload = decodeJwt(tokens.accessToken) as unknown as AccessTokenPayload;
  if (!payload || dayjs(new Date(payload.exp * 1000)).isBefore(dayjs())) {
    if (retry) {
      const payload = decodeJwt(tokens.refreshToken) as unknown as RefreshTokenPayload;
      const accessTokenResponse = await renewAccessToken({
        ...tokens,
        userId: payload.data.id,
      });

      saveAuthTokens({
        accessToken: accessTokenResponse,
        refreshToken: tokens.refreshToken,
      });
      return getAuthInfo({ retry: false });
    } else {
      clearAuthTokens();
      throw new Error('Token expired');
    }
  }
  return {
    ...payload.data,
    accessToken: tokens.accessToken,
  };
}
