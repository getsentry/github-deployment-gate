import { ThemeProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { ModalProvider } from './components/molecules/ModalProvider';
import { AppRoutes } from './constants/Routes';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { OAuthCallbackHandler } from './pages/OAuthCallbackHandler';
import SetupPage from './pages/SetupPage';
import { getAuthInfo } from './services/auth';
import { trpc } from './services/trpc';
import GlobalStyles from './styles/GlobalStyles';
import { darkTheme, lightTheme } from './styles/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60_000, // 60 sec
    },
  },
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      headers: async () => {
        const authInfo = await getAuthInfo({ retry: true });
        return {
          Authorization: `Bearer ${authInfo?.accessToken}`,
        };
      },
    }),
  ],
});

function App() {
  const lightThemeMediaQuery = window.matchMedia('(prefers-color-scheme: light)');
  return (
    <RecoilRoot>
      <ThemeProvider theme={lightThemeMediaQuery?.matches ? lightTheme : darkTheme}>
        <GlobalStyles />
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <Router>
              <Routes>
                <Route path={AppRoutes.SentrySetup} element={<SetupPage />} />
                <Route path={AppRoutes.Dashboard} element={<Dashboard />} />
                <Route path={AppRoutes.Login} element={<Login />} />
                <Route path={AppRoutes.Home} element={<Login />} />
                <Route
                  path={AppRoutes.GithubOauthCallback}
                  element={<OAuthCallbackHandler />}
                />
              </Routes>
            </Router>
            <ModalProvider />
          </QueryClientProvider>
        </trpc.Provider>
      </ThemeProvider>
    </RecoilRoot>
  );
}

export default App;
