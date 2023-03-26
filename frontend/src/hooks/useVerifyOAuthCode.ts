import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { verifyOAuthCode } from '../services/auth';

interface Options {
  onError?: (error: unknown) => void;
  onSuccess?: () => void;
}

export function useVerifyOAuthCode(options?: Options) {
  const [searchParams] = useSearchParams();

  const { mutate, isLoading } = useMutation(verifyOAuthCode, {
    onSuccess: () => {
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      if (options?.onError) {
        options.onError(error);
      }
    },
  });

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      if (options?.onError) {
        options.onError(new Error('No oauth code in URL'));
      }
      return;
    }
    mutate(code);
  }, []);

  return { isLoading };
}
