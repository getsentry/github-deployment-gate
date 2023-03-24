import styled from '@emotion/styled';
import React, {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';

import BasePage from '../components/BasePage';
import Button from '../components/Button';
import Main from '../components/Main';
import SentryLogo from '../components/SentryLogo';
import {SENTRY_INSTALLATION_ID, SENTRY_ORG_SLUG} from '../constants/browserStorage';
import {makeBackendRequest} from '../util';

function SetupPage() {
  function loginWithGithub() {
    const scope = 'offline_access';
    window.location.assign(
      `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}&scope=${scope}`
    );
  }

  const [setupAPICallState, setSetupAPICallState] = useState('loading');

  useEffect(() => {
    console.log('use effect started');

    async function createSentryInstallationEntry() {
      const sentryInstallationId = searchParams.get('installationId');
      const sentryOrgSlug = searchParams.get('orgSlug');
      if (sentryInstallationId) {
        window.localStorage.setItem(SENTRY_INSTALLATION_ID, sentryInstallationId);
      }
      if (sentryOrgSlug) {
        window.localStorage.setItem(SENTRY_ORG_SLUG, sentryOrgSlug);
      }
      const payload = {
        code: searchParams.get('code'),
        installationId: sentryInstallationId,
        sentryOrgSlug: sentryOrgSlug,
      };
      const response = await makeBackendRequest('/api/sentry/setup/', payload, {
        method: 'POST',
      });
      setSetupAPICallState(response.status);
    }
    createSentryInstallationEntry();
  }, []);
  const [searchParams] = useSearchParams();

  return (
    <BasePage>
      <Main>
        <SentryApplicationLogo size={30} />
        {setupAPICallState === 'error' ? (
          <React.Fragment>
            <h2>You can not access this page!</h2>
          </React.Fragment>
        ) : setupAPICallState === 'success' ? (
          <React.Fragment>
            <PreInstallTextBlock />
            <Button className="primary" onClick={loginWithGithub}>
              Login with Github
            </Button>
          </React.Fragment>
        ) : (
          <></>
        )}
      </Main>
    </BasePage>
  );
}
export const SentryApplicationLogo = styled(SentryLogo)`
  color: ${p => p.theme.surface100};
  margin: 0 auto;
  display: block;
  background: ${p => p.theme.gray300};
  box-sizing: content-box;
  padding: 1rem;
  border-radius: 1rem;
`;

const PreInstallTextBlock = () => (
  <React.Fragment>
    <h2>Complete your integration of Sentry with Sentry Github Deployment Gate!</h2>
    <p>
      By completing this installation, you&apos;ll be able to configure Sentry to
      automatically fail the gate if any new issues are reported within a predetermined
      time frame.
    </p>
  </React.Fragment>
);

export default SetupPage;
