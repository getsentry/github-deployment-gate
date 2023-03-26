export interface AccessTokenPayload {
  sub: string;
  data: {
    id: number;
    name: string;
    githubHandle: string;
  };
}

export interface RefreshTokenPayload {
  sub: string;
  data: {
    id: number;
    name: string;
    githubHandle: string;
  };
}
