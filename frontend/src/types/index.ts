import type { TrpcOutput } from '../services/trpc';

export interface ITokenPayload {
  accessToken: string;
  refreshToken: string;
}

export interface ISignInPayload {
  code: string;
  sentryInstallationId?: string;
}

export interface ISigninResponse {
  accessToken: string;
  refreshToken: string;
  user: TrpcOutput['auth']['profile'];
}

export interface IRenewTokenPayload {
  userId: number;
  accessToken: string;
  refreshToken: string;
}

export interface AccessTokenPayload {
  sub: string;
  exp: number;
  data: {
    id: number;
    name: string;
    githubHandle: string;
  };
}

export interface RefreshTokenPayload {
  sub: string;
  exp: number;
  data: {
    id: number;
    name: string;
    githubHandle: string;
  };
}
