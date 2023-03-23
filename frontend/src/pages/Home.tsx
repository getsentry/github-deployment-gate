import styled from '@emotion/styled';
import React, {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';

import BasePage from '../components/BasePage';
import Button from '../components/Button';
import FailureModal from '../components/FailureModal';
import Header from '../components/Header';
import SentryLogo from '../components/SentryLogo';
import SuccessModal from '../components/SuccessModal';
import ThemedSelect from '../components/ThemedSelect';
import {
  ACCESS_TOKEN,
  AVATAR_URL,
  GITHUB_HANDLE,
  SENTRY_INSTALLATION_ID,
} from '../constants/browserStorage';
import {DeploymentRequest, GithubRepo, SentryInstallation} from '../types';
import {makeBackendRequest} from '../util';

function Home() {
  const [rerender, setRerender] = useState(false);
  const [githubHandle, setGithubHandle] = useState(
    localStorage.getItem(GITHUB_HANDLE) ? localStorage.getItem(GITHUB_HANDLE) : ''
  );
  const [avatarURL, setAvatarURL] = useState(
    localStorage.getItem(AVATAR_URL) ? localStorage.getItem(AVATAR_URL) : undefined
  );

  const [repos, setRepos] = useState<Array<GithubRepo>>([]);
  const [isFetchRepoAPILoading, setIsFetchRepoAPILoading] = useState(true);

  const [sentryInstallation, setSentryInstallation] = useState<SentryInstallation>();
  const [isFetchSentryInstallationAPILoading, setIsFetchSentryInstallationAPILoading] =
    useState(true);

  const [deploymentRequests, setDeploymentRequests] = useState<Array<DeploymentRequest>>(
    []
  );
  const [isFetchDeploymentReqAPILoading, setIsFetchDeploymentReqAPILoading] =
    useState(true);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function handleClose() {
    setShowSuccessModal(false);
    setShowFailureModal(false);
    setErrorMessage('');
  }

  function handleLogout() {
    localStorage.clear();
    window.location.assign('/login');
  }

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

    async function fetchDeploymentRequests(githubHandle: string) {
      const response = await makeBackendRequest(
        `/api/github/deployment/requests?githubHandle=${githubHandle}`,
        undefined,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          },
        }
      );
      setIsFetchDeploymentReqAPILoading(false);
      if (response && response.data) {
        setDeploymentRequests(response.data);
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
          localStorage.setItem(AVATAR_URL, response.github_user_data.data.avatar_url);
          setGithubHandle(response.github_user_data.data.login);
          setAvatarURL(response.github_user_data.data.avatar_url);
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
        await getAccessToken(codeParam);
        window.location.assign('/home');
      } else {
        if (!localStorage.getItem(ACCESS_TOKEN) || !localStorage.getItem(GITHUB_HANDLE)) {
          window.location.assign('/login');
        }
      }
      const githubHandle = localStorage.getItem(GITHUB_HANDLE);
      if (githubHandle) {
        fetchGithubRepos(githubHandle);
        fetchSentryInstallation(githubHandle);
        fetchDeploymentRequests(githubHandle);
      }
    }
    process();
  }, [rerender]);

  const [searchParams] = useSearchParams();

  function handleWaitPeriodChange(value: number, index: number) {
    setRepos(prevList => {
      const newList = [...prevList];
      newList[index].waitPeriodToCheckForIssue = value;
      return newList;
    });
  }

  function handleUpdateClick(repoId: number, index: number) {
    const newValue = repos[index].waitPeriodToCheckForIssue;

    makeBackendRequest(
      `/api/github/repo/waittime`,
      {
        repoId: repoId,
        waitTime: newValue,
      },
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          'Content-Type': 'application/json',
        },
      }
    )
      .then(response => {
        console.log({response});
        if (response && response.status === 'success') {
          setShowSuccessModal(true);
        } else {
          setShowFailureModal(true);
          setErrorMessage(response.message);
        }
      })
      .catch(error => {
        setShowFailureModal(true);
        setErrorMessage(error.message);
      });
  }

  function handleApproveRejectClick(sha: string, action: string) {
    makeBackendRequest(
      `/api/github/deploymentgate`,
      {
        releaseId: sha,
        status: action,
      },
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          'Content-Type': 'application/json',
        },
      }
    )
      .then(response => {
        console.log({response});
        if (response && response.status === 'success') {
          setRerender(!rerender);
          setShowSuccessModal(true);
        } else {
          setShowFailureModal(true);
          setErrorMessage(response.message);
        }
      })
      .catch(error => {
        setShowFailureModal(true);
        setErrorMessage(error.message);
      });
  }

  return (
    <BasePage>
      <Header onLogout={handleLogout} imageUrl={avatarURL || undefined} />
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
                      {/* Github Repos:
                      {repos.map(s => {
                        return <div key={s.name}>{s.name}</div>;
                      })} */}
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
                      {/* Sentry Projects:
                      {sentryInstallation.projectSlugs.map(s => {
                        return <div key={s}>{s}</div>;
                      })} */}
                    </div>
                  )
                ) : (
                  <></>
                )}
                {!isFetchRepoAPILoading && repos && repos.length > 0 ? (
                  <>
                    <div>
                      <div style={{display: 'flex'}}>
                        <div
                          style={{width: '50%', textAlign: 'center', fontWeight: 'bold'}}
                        >
                          Github Repo
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
                      {repos?.map((repo, index) => {
                        return (
                          <div key={repo.id} style={{display: 'flex'}}>
                            <div
                              style={{
                                width: '50%',
                                textAlign: 'center',
                                paddingTop: '1rem',
                              }}
                            >
                              <label style={{fontSize: '20px', margin: '1rem'}}>
                                {repo.name}
                              </label>
                            </div>
                            <div style={{width: '25%', textAlign: 'center'}}>
                              <input
                                style={{minHeight: '38px', margin: '1rem'}}
                                type="number"
                                id="wait-time"
                                value={repo.waitPeriodToCheckForIssue}
                                onChange={e =>
                                  handleWaitPeriodChange(Number(e.target.value), index)
                                }
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
                              <Button
                                id={'update' + repo.id}
                                style={{minHeight: '38px', margin: '1rem', width: '8rem'}}
                                onClick={() => handleUpdateClick(repo.id, index)}
                              >
                                Update
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      <div></div>
                    </div>
                    {!isFetchDeploymentReqAPILoading &&
                    deploymentRequests &&
                    deploymentRequests.length > 0 ? (
                      <div>
                        <h3>Pending Deployment Requests</h3>
                        <div>
                          <div style={{display: 'flex'}}>
                            <div
                              style={{
                                width: '30%',
                                textAlign: 'center',
                                fontWeight: 'bold',
                              }}
                            >
                              Github Repo
                            </div>
                            <div
                              style={{
                                width: '30%',
                                textAlign: 'center',
                                fontWeight: 'bold',
                              }}
                            >
                              SHA
                            </div>
                            <div
                              style={{
                                width: '20%',
                                textAlign: 'center',
                                fontWeight: 'bold',
                              }}
                            >
                              Requested At
                            </div>
                            <div
                              style={{
                                width: '20%',
                                textAlign: 'center',
                                fontWeight: 'bold',
                              }}
                            >
                              Action
                            </div>
                          </div>
                          {deploymentRequests?.map((deploymentRequest, index) => {
                            return (
                              <div key={deploymentRequest.id} style={{display: 'flex'}}>
                                <div
                                  style={{
                                    width: '30%',
                                    textAlign: 'center',
                                    paddingTop: '1rem',
                                  }}
                                >
                                  <label style={{fontSize: '12px', margin: '1rem'}}>
                                    {
                                      repos.find(
                                        repo => repo.id == deploymentRequest.githubRepoId
                                      )?.name
                                    }
                                  </label>
                                </div>
                                <div
                                  style={{
                                    width: '30%',
                                    textAlign: 'center',
                                    paddingTop: '1rem',
                                  }}
                                >
                                  <label style={{fontSize: '12px', margin: '1rem'}}>
                                    {deploymentRequest.sha}
                                  </label>
                                </div>
                                <div
                                  style={{
                                    width: '20%',
                                    textAlign: 'center',
                                    paddingTop: '1rem',
                                  }}
                                >
                                  <label style={{fontSize: '12px', margin: '1rem'}}>
                                    {deploymentRequest.createdAt}
                                  </label>
                                </div>

                                <div
                                  style={{
                                    width: '20%',
                                    textAlign: 'center',
                                    display: 'flex',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Button
                                    id={'approve' + deploymentRequest.id}
                                    style={{
                                      minHeight: '38px',
                                      margin: '1rem',
                                      width: '6rem',
                                    }}
                                    onClick={() =>
                                      handleApproveRejectClick(
                                        deploymentRequest.sha,
                                        'approved'
                                      )
                                    }
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    id={'reject-' + deploymentRequest.id}
                                    style={{
                                      minHeight: '38px',
                                      margin: '1rem',
                                      width: '6rem',
                                    }}
                                    onClick={() =>
                                      handleApproveRejectClick(
                                        deploymentRequest.sha,
                                        'rejected'
                                      )
                                    }
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                  </>
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

        {showSuccessModal && <SuccessModal onClose={handleClose} />}

        {showFailureModal && (
          <FailureModal onClose={handleClose} message={errorMessage} />
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
