import styled from '@emotion/styled';
import React, {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';

import BasePage from '../components/BasePage';
import Button from '../components/Button';
import Main from '../components/Main';
import SentryLogo from '../components/SentryLogo';
import {SENTRY_INSTALLATION_ID, SENTRY_ORG_SLUG} from '../constants/browserStorage';
import {makeBackendRequest} from '../util';

const REDIRECT_TIMEOUT = 3 * 1000;

function SetupPage() {
  function loginWithGithub() {
    window.location.assign(
      `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`
    );
  }

  const [redirect, setRedirect] = useState('');

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
      const {redirectUrl} = await makeBackendRequest('/api/sentry/setup/', payload, {
        method: 'POST',
      });
    }
    // createSentryInstallationEntry();
  }, []);
  const [searchParams] = useSearchParams();

  return (
    <BasePage>
      <Main>
        <SentryApplicationLogo size={30} />
        {redirect ? (
          <React.Fragment>
            <h2>You&apos;ve successfully linked ACME Kanban and Sentry!</h2>
            <p>You should be redirected in a few seconds.</p>
            <StyledLink href={redirect} data-testid="direct-link">
              Take me back to Sentry
            </StyledLink>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <PreInstallTextBlock />
            <Button className="primary" onClick={loginWithGithub}>
              Login with Github
            </Button>
          </React.Fragment>
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

const StyledLink = styled.a`
  color: ${p => p.theme.blue300};
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
