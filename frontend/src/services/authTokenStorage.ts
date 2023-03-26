import { decodeJwt } from 'jose';

import * as BrowserStorage from '../constants/BrowserStorage';

export function saveAuthTokens(tokens: { accessToken: string; refreshToken: string }) {
  window.localStorage.setItem(BrowserStorage.ACCESS_TOKEN, tokens.accessToken);
  window.localStorage.setItem(BrowserStorage.REFRESH_TOKEN, tokens.refreshToken);
}

export function loadAuthTokens(): {
  accessToken: string;
  refreshToken: string;
} | null {
  const accessToken = window.localStorage.getItem(BrowserStorage.ACCESS_TOKEN);
  const refreshToken = window.localStorage.getItem(BrowserStorage.REFRESH_TOKEN);
  if (!accessToken || !refreshToken) {
    console.error('Tokens not found');
    return null;
  }
  // test both tokens
  if (!decodeJwt(accessToken) || !decodeJwt(refreshToken)) {
    console.error('Invalid tokens');
    return null;
  }
  return { accessToken, refreshToken };
}

export function clearAuthTokens() {
  window.localStorage.removeItem(BrowserStorage.ACCESS_TOKEN);
  window.localStorage.removeItem(BrowserStorage.REFRESH_TOKEN);
}
