import styled from '@emotion/styled';
import React from 'react';
import { Link } from 'react-router-dom';

import SentryLogo from '../components/atoms/SentryLogo';
import Header from '../components/molecules/Header';
import { GithubRepoRow } from '../components/organisms/GithubRepoRow';
import { PendingDeploymentRequests } from '../components/organisms/PendingDeploymentRequests';
import BasePage from '../components/templates/BasePage';
import { AppRoutes } from '../constants/Routes';
import { useAuth } from '../hooks/useAuth';
import { useSignout } from '../hooks/useSignout';
import { trpc } from '../services/trpc';

function Dashboard() {
  const { isSuccess: isAuthed, isLoading: isAuthLoading } = useAuth();
  const { data: userProfile } = trpc.auth.profile.useQuery();
  const { mutate: signOut } = useSignout();
  const { data: repos, isLoading: isLoadingRepos } = trpc.github.repositories.useQuery(
    {
      githubHandle: userProfile?.githubHandle ?? '',
    },
    {
      enabled: Boolean(userProfile?.githubHandle),
    }
  );
  const { data: deploymentRequests, isLoading: isLoadingDeploymentRequests } =
    trpc.github.deploymentRequests.useQuery(
      {
        githubHandle: userProfile?.githubHandle ?? '',
      },
      {
        enabled: Boolean(userProfile?.githubHandle),
        refetchInterval: 60_000,
      }
    );
  const { data: sentryInstallations, isLoading: isLoadingSentryInstallations } =
    trpc.github.sentryInstallations.useQuery(
      {
        githubHandle: userProfile?.githubHandle ?? '',
      },
      {
        enabled: Boolean(userProfile?.githubHandle),
      }
    );

  return (
    <BasePage>
      <Header onLogout={signOut} imageUrl={userProfile?.avatar} isAuthed={isAuthed} />
      {isAuthed ? (
        <Main>
          <h2>Welcome {userProfile?.name}!</h2>
          {!isLoadingRepos ? (
            !repos?.length ? (
              <>
                <p>
                  You have not installed our Github app SentryDeploymentGate on any of
                  your Github Repo yet. You must be the person that installed the
                  application to view repos on this list. Please install Github App
                  SentryDeploymentGate via this link:{' '}
                  <a
                    href="https://github.com/apps/sentry-deployment-gate"
                    target="_blank"
                    rel="noreferrer"
                  >
                    https://github.com/apps/sentry-deployment-gate
                  </a>
                </p>
              </>
            ) : (
              <div style={{ marginBottom: '2rem' }}>
                {/* Github Repos:
                      {repos.map(s => {
                        return <div key={s.name}>{s.name}</div>;
                      })} */}
              </div>
            )
          ) : null}
          {!isLoadingSentryInstallations ? (
            !sentryInstallations?.length ? (
              <>
                <p>
                  You have not installed our Sentry integration yet. Please install our
                  public Sentry integration named TestSentryApp. For installation, you
                  need to login to your sentry dashboard, go to settings and click on
                  Integrations. Search for `TestSentryApp` in public section.
                </p>
              </>
            ) : (
              <div style={{ marginBottom: '2rem' }}>
                {/* Sentry Projects:
                      {sentryInstallation.projectSlugs.map(s => {
                        return <div key={s}>{s}</div>;
                      })} */}
              </div>
            )
          ) : null}
          {!isLoadingRepos && repos?.length ? (
            <>
              <div>
                <div style={{ display: 'flex' }}>
                  <div style={{ width: '50%', textAlign: 'center', fontWeight: 'bold' }}>
                    Github Repo
                  </div>
                  <div style={{ width: '25%', textAlign: 'center', fontWeight: 'bold' }}>
                    Wait Time (In Seconds)
                  </div>
                  <div style={{ width: '25%', textAlign: 'center', fontWeight: 'bold' }}>
                    Action
                  </div>
                </div>
                {repos?.map((repo) => (
                  <GithubRepoRow key={repo.id} repo={repo} />
                ))}
              </div>
              {!isLoadingDeploymentRequests &&
              deploymentRequests &&
              deploymentRequests.length > 0 ? (
                <PendingDeploymentRequests
                  deploymentRequests={deploymentRequests}
                  repos={repos}
                />
              ) : null}
            </>
          ) : null}
        </Main>
      ) : (
        <Main>
          {isAuthLoading ? (
            <p>Loading...</p>
          ) : (
            <p>
              You&apos;re not authorized to view this page. Please{' '}
              <Link to={AppRoutes.Login}>Login</Link>
            </p>
          )}
        </Main>
      )}
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

const Main = styled.main`
  background: ${(p) => p.theme.gray100};
  margin: 3rem auto;
  max-width: 90%;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 2px 2px 8px ${(p) => p.theme.blue200};
  ul {
    padding-left: 2rem;
    li {
      margin: 0.5rem 0;
    }
  }
  hr {
    color: ${(p) => p.theme.blue200};
  }
  h3 {
    margin-top: 0;
  }
  button {
    display: block;
    margin: 0 auto;
  }
`;

export default Dashboard;
