import { useNavigate } from 'react-router-dom';

import { AppRoutes } from '../constants/Routes';
import { clearAuthTokens } from '../services/authTokenStorage';
import { trpc } from '../services/trpc';

export function useSignout() {
  const navigate = useNavigate();

  return trpc.auth.signOut.useMutation({
    onSuccess: () => {
      clearAuthTokens();
      navigate(AppRoutes.Home);
    },
  });
}
