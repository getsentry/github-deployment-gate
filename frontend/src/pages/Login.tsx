import styled from '@emotion/styled';
import React, {useEffect, useState} from 'react';

import BasePage from '../components/BasePage';
import Button from '../components/Button';
import Main from '../components/Main';
import SentryLogo from '../components/SentryLogo';

function Login() {
  function loginWithGithub() {
    const scope = 'offline_access';
    window.location.assign(
      `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}&scope=${scope}`
    );
  }

  const [redirect, setRedirect] = useState('');

  useEffect(() => {
    console.log('use effect started');
  }, []);

  return (
    <BasePage>
      <Main>
        <SentryApplicationLogo size={30} />
        <React.Fragment>
          <PreInstallTextBlock />
          <Button className="primary" onClick={loginWithGithub}>
            Login with Github
          </Button>
        </React.Fragment>
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
    <h2>Welcome to Sentry Github Deployment Gate!</h2>
    <p></p>
  </React.Fragment>
);

export default Login;
