import { useQuery } from '@tanstack/react-query';

import { QueryKeys } from '../constants/QueryKeys';
import { getAuthInfo } from '../services/auth';

export function useAuth() {
  return useQuery(
    [QueryKeys.Auth],
    async () => {
      const authInfo = await getAuthInfo({ retry: true });
      if (!authInfo) {
        throw new Error('Not authenticated');
      }
      return authInfo;
    },
    {
      staleTime: 0,
      retry: false,
    }
  );
}
