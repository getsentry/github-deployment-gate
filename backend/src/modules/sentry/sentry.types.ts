export type TokenResponseData = {
  expiresAt: string; // ISO date string at which token must be refreshed
  token: string; // Bearer token authorized to make Sentry API requests
  refreshToken: string; // Refresh token required to get a new Bearer token after expiration
};

export type InstallResponseData = {
  app: {
    uuid: string; // UUID for your application (shared across installations)
    slug: string; // URL slug for your application (shared across installations)
  };
  organization: {
    slug: string; // URL slug for the organization doing the installation
  };
  uuid: string; // UUID for the individual installation
};
