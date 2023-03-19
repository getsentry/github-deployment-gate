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
import {GithubRepo, SentryInstallation} from '../types';
import {makeBackendRequest} from '../util';

const REDIRECT_TIMEOUT = 3 * 1000;

function Home() {
  const [redirect, setRedirect] = useState('');
  const [rerender, setRerender] = useState(false);
  const [githubHandle, setGithubHandle] = useState(
    localStorage.getItem(GITHUB_HANDLE) ? localStorage.getItem(GITHUB_HANDLE) : ''
  );
  const [repos, setRepos] = useState<Array<GithubRepo>>();
  const [isFetchRepoAPILoading, setIsFetchRepoAPILoading] = useState(true);

  const [sentryInstallation, setSentryInstallation] = useState<SentryInstallation>();
  const [isFetchSentryInstallationAPILoading, setIsFetchSentryInstallationAPILoading] =
    useState(true);

  useEffect(() => {
    async function fetchGithubRepos(githubHandle: string) {
      const response = await makeBackendRequest(
        `/api/github/githubRepo?githubHandle=${githubHandle}`,
        undefined,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          },
        }
      );
      setIsFetchRepoAPILoading(false);
      if (response && response.data) {
        setRepos(response.data);
      }
    }
    async function fetchSentryInstallation(githubHandle: string) {
      const response = await makeBackendRequest(
        `/api/github/sentryInstallation?githubHandle=${githubHandle}`,
        undefined,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          },
        }
      );
      if (response && response.data) {
        setSentryInstallation(response.data);
      }
      setIsFetchSentryInstallationAPILoading(false);
    }
    async function getAccessToken(code: string) {
      const response = await makeBackendRequest(
        `/api/github/login/getAccessToken?code=${code}&sentryInstallationId=${
          localStorage.getItem(SENTRY_INSTALLATION_ID)
            ? localStorage.getItem(SENTRY_INSTALLATION_ID)
            : 'null'
        }`,
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
    async function process() {
      const codeParam = searchParams.get('code');
      console.log(codeParam);
      if (codeParam) {
        getAccessToken(codeParam);
      } else {
        if (!localStorage.getItem(ACCESS_TOKEN) || !localStorage.getItem(GITHUB_HANDLE)) {
          window.location.assign('/login');
        }
      }
      const githubHandle = localStorage.getItem(GITHUB_HANDLE);
      if (githubHandle) {
        fetchGithubRepos(githubHandle);
        fetchSentryInstallation(githubHandle);
      }
    }
    process();
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
                {!isFetchRepoAPILoading ? (
                  !repos || repos.length == 0 ? (
                    <>
                      <p>
                        You have not installed our Github app SentryDeploymentGate on any
                        of your Github Repo yet. Please install Github App
                        SentryDeploymentGate via this link:{' '}
                        <a
                          href="https://github.com/apps/sentrydeploymentgate"
                          target="_blank"
                          rel="noreferrer"
                        >
                          https://github.com/apps/sentrydeploymentgate
                        </a>
                      </p>
                    </>
                  ) : (
                    <div style={{marginBottom: '2rem'}}>
                      Github Repos:
                      {repos.map(s => {
                        return <div key={s.name}>{s.name}</div>;
                      })}
                    </div>
                  )
                ) : (
                  <></>
                )}
                {!isFetchSentryInstallationAPILoading ? (
                  !sentryInstallation ? (
                    <>
                      <p>
                        You have not installed our Sentry integration yet. Please install
                        our public Sentry integration named TestSentryApp. For
                        installation, you need to login to your sentry dashboard, go to
                        settings and click on Integrations. Search for `TestSentryApp` in
                        public section.
                      </p>
                    </>
                  ) : (
                    <div style={{marginBottom: '2rem'}}>
                      Sentry Projects:
                      {sentryInstallation.projectSlugs.map(s => {
                        return <div key={s}>{s}</div>;
                      })}
                    </div>
                  )
                ) : (
                  <></>
                )}
                {!isFetchRepoAPILoading &&
                !isFetchSentryInstallationAPILoading &&
                repos &&
                repos.length > 0 &&
                sentryInstallation &&
                sentryInstallation.projectSlugs &&
                sentryInstallation.projectSlugs.length > 0 ? (
                  <div>
                    <div style={{display: 'flex'}}>
                      <div
                        style={{width: '25%', textAlign: 'center', fontWeight: 'bold'}}
                      >
                        Github Repo
                      </div>
                      <div
                        style={{width: '25%', textAlign: 'center', fontWeight: 'bold'}}
                      >
                        Sentry Project
                      </div>
                      <div
                        style={{width: '25%', textAlign: 'center', fontWeight: 'bold'}}
                      >
                        Wait Time (In Seconds)
                      </div>
                      <div
                        style={{width: '25%', textAlign: 'center', fontWeight: 'bold'}}
                      >
                        Action
                      </div>
                    </div>
                    {repos?.map(repo => {
                      return (
                        <div style={{display: 'flex'}}>
                          <div
                            style={{
                              width: '25%',
                              textAlign: 'center',
                              paddingTop: '1rem',
                            }}
                          >
                            <label style={{fontSize: '20px', margin: '1rem'}}>
                              {repo.name}
                            </label>
                          </div>
                          <div style={{width: '25%', textAlign: 'center'}}>
                            <StyledSelect
                              options={sentryInstallation.projectSlugs?.map(s => ({
                                value: `${s}`,
                                label: s,
                              }))}
                              placeholder="Select a sentry project..."
                            />{' '}
                          </div>
                          <div style={{width: '25%', textAlign: 'center'}}>
                            <input
                              style={{minHeight: '38px', margin: '1rem'}}
                              type="number"
                              id="wait-time"
                              value={repo.waitPeriodToCheckForIssue}
                            ></input>
                          </div>
                          <div
                            style={{
                              width: '25%',
                              textAlign: 'center',
                              display: 'flex',
                              justifyContent: 'center',
                            }}
                          >
                            <button
                              style={{minHeight: '38px', margin: '1rem'}}
                              id="update"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div></div>
                  </div>
                ) : (
                  <></>
                )}
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
const StyledSelect = styled(ThemedSelect)`
  flex: 1;
  margin: 1rem;
  font-size: ${p => p.theme.text.baseSize};
  * {
    white-space: normal !important;
  }
`;
export default Home;
