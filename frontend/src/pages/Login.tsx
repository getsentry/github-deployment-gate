import styled from '@emotion/styled';
import React from 'react';

import LinkButton from '../components/atoms/LinkButton';
import Main from '../components/atoms/Main';
import SentryLogo from '../components/atoms/SentryLogo';
import BasePage from '../components/templates/BasePage';
import { GITHUB_CLIENT_ID } from '../constants/EnvVars';

function Login() {
  return (
    <BasePage>
      <Main style={{ textAlign: 'center' }}>
        <SentryApplicationLogo size={30} />
        <React.Fragment>
          <PreInstallTextBlock />
          <LinkButton
            className="primary"
            href={`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=offline_access`}
          >
            Login with Github
          </LinkButton>
        </React.Fragment>
      </Main>
    </BasePage>
  );
}
export const SentryApplicationLogo = styled(SentryLogo)`
  color: ${(p) => p.theme.surface100};
  margin: 0 auto;
  display: block;
  background: ${(p) => p.theme.gray300};
  box-sizing: content-box;
  padding: 1rem;
  border-radius: 1rem;
`;

const PreInstallTextBlock = () => (
  <React.Fragment>
    <h2>Welcome to Sentry Github Deployment Gate!</h2>
    <p></p>
  </React.Fragment>
);

export default Login;
