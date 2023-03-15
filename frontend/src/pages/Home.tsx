import styled from '@emotion/styled';
import React, {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';

import BasePage from '../components/BasePage';
import SentryLogo from '../components/SentryLogo';
import ThemedSelect from '../components/ThemedSelect';
import {
  ACCESS_TOKEN,
  GITHUB_HANDLE,
  SENTRY_INSTALLATION_ID,
  SENTRY_ORG_SLUG,
} from '../constants/browserStorage';
import {makeBackendRequest} from '../util';

const REDIRECT_TIMEOUT = 3 * 1000;

function Home() {
  const [redirect, setRedirect] = useState('');
  const [rerender, setRerender] = useState(false);
  const [githubHandle, setGithubHandle] = useState('');

  async function getUserData() {
    const response = await makeBackendRequest(
      `/api/github/login/getUserData`,
      undefined,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      }
    );
    console.log(response);
    return response;
  }

  useEffect(() => {
    async function getAccessToken(code: string) {
      const response = await makeBackendRequest(
        `/api/github/login/getAccessToken?code=${code}`,
        undefined,
        {
          method: 'GET',
        }
      );
      if (response && response.access_token) {
        localStorage.setItem(ACCESS_TOKEN, response.access_token);
        setRerender(!rerender);
        if (response.github_user_data) {
          console.log(response.github_user_data);
          localStorage.setItem(GITHUB_HANDLE, response.github_user_data.data.login);
          setGithubHandle(response.github_user_data.data.login);
        }
      } else {
        window.location.assign('/login');
      }
      return response.access_token;
    }
    const codeParam = searchParams.get('code');
    console.log(codeParam);
    if (codeParam && localStorage.getItem(ACCESS_TOKEN) === null) {
      getAccessToken(codeParam);
    }
  }, []);

  const [searchParams] = useSearchParams();

  return (
    <BasePage>
      <Main>
        {localStorage.getItem(ACCESS_TOKEN) ? (
          <>
            <React.Fragment>
              <React.Fragment>
                <h2>Welcome {githubHandle}!</h2>
                <p></p>
              </React.Fragment>
              <h1></h1>
            </React.Fragment>
          </>
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
    <h2>Welcome !</h2>
    <p></p>
  </React.Fragment>
);

const Main = styled.main`
  background: ${p => p.theme.gray100};
  margin: 3rem auto;
  max-width: 90%;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 2px 2px 8px ${p => p.theme.blue200};
  ul {
    padding-left: 2rem;
    li {
      margin: 0.5rem 0;
    }
  }
  hr {
    color: ${p => p.theme.blue200};
  }
  h3 {
    margin-top: 0;
  }
  button {
    display: block;
    margin: 0 auto;
  }
`;

export default Home;
