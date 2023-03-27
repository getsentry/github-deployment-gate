import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { SENTRY_INSTALLATION_ID, SENTRY_ORG_SLUG } from '../constants/BrowserStorage';
import { makeBackendRequest } from '../util';

export function useSetupSentry() {
  const [searchParams] = useSearchParams();
  const [sentrySetupState, setSentrySetupState] = useState('loading');

  useEffect(() => {
    createSentryInstallationEntry({
      sentryInstallationId: searchParams.get('installationId'),
      sentryOrgSlug: searchParams.get('orgSlug'),
      code: searchParams.get('code'),
    }).then((status: string) => setSentrySetupState(status));
  }, []);

  return { sentrySetupState };
}

async function createSentryInstallationEntry({
  code,
  sentryInstallationId,
  sentryOrgSlug,
}: {
  sentryInstallationId: string | null;
  sentryOrgSlug: string | null;
  code: string | null;
}) {
  if (sentryInstallationId) {
    window.localStorage.setItem(SENTRY_INSTALLATION_ID, sentryInstallationId);
  }
  if (sentryOrgSlug) {
    window.localStorage.setItem(SENTRY_ORG_SLUG, sentryOrgSlug);
  }
  const payload = {
    code,
    installationId: sentryInstallationId,
    sentryOrgSlug: sentryOrgSlug,
  };
  const response = await makeBackendRequest('/api/sentry/setup/', payload, {
    method: 'POST',
  });
  return response.status;
}
