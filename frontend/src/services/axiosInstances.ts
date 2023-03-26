import type { AxiosHeaders, AxiosResponse } from 'axios';
import axios from 'axios';
import dayjs from 'dayjs';
import { decodeJwt } from 'jose';

import { AccessTokenPayload } from '../types';
import { renewAccessToken } from './auth';
import { loadAuthTokens, saveAuthTokens } from './authTokenStorage';

function axiosResponseHandler(response: AxiosResponse) {
  return response;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function axiosErrorHandler(error: any) {
  // Do something with response error
  return Promise.reject(error?.response?.data);
}

export const axiosAuthInstance = axios.create({
  baseURL: '/api/auth',
  headers: { 'Content-Type': 'application/json' },
});

axiosAuthInstance.interceptors.response.use(axiosResponseHandler, axiosErrorHandler);

export const axiosVerifiedInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

axiosVerifiedInstance.interceptors.request.use(
  async (config) => {
    const tokens = loadAuthTokens();
    if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
      throw new Error("You're not logged in");
    }
    const payload = decodeJwt(tokens.accessToken) as unknown as AccessTokenPayload;
    let { accessToken } = tokens;
    if (!payload || dayjs(new Date(payload.exp * 1000)).isBefore(dayjs())) {
      const accessTokenResponse = await renewAccessToken({
        ...tokens,
        userId: payload.data.id,
      });

      saveAuthTokens({
        accessToken: accessTokenResponse,
        refreshToken: tokens.refreshToken,
      });
      accessToken = accessTokenResponse;
    }

    if (config.headers) {
      (config.headers as AxiosHeaders).set('Authorization', `Bearer ${accessToken}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosVerifiedInstance.interceptors.response.use(axiosResponseHandler, axiosErrorHandler);
