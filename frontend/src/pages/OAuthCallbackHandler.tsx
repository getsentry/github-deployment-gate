import React from 'react';
import { useNavigate } from 'react-router-dom';

import Main from '../components/atoms/Main';
import Header from '../components/molecules/Header';
import BasePage from '../components/templates/BasePage';
import { AppRoutes } from '../constants/Routes';
import { useVerifyOAuthCode } from '../hooks/useVerifyOAuthCode';

export function OAuthCallbackHandler() {
  const navigate = useNavigate();

  useVerifyOAuthCode({
    onSuccess: () => {
      navigate(AppRoutes.Dashboard, { replace: true });
    },
    onError: (err) => {
      console.error(err);
      // TODO: show toast error message
      navigate(AppRoutes.Login, { replace: true });
    },
  });

  return (
    <BasePage>
      <Header />
      <Main>
        <p>You are being logged in. Please wait...</p>
      </Main>
    </BasePage>
  );
}
