export type User = {
  id: number;
  name?: string;
  username?: string;
  avatar?: string;
};

export type GithubRepo = {
  id: number;
  name: string;
  sentryProjectSlug: string;
  waitPeriodToCheckForIssue: number;
  sentryInstallationId: number;
  userId: number;
};

export type SentryInstallation = {
  id: number;
  uuid: string;
  orgSlug: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  projectSlugs: Array<string>;
};
