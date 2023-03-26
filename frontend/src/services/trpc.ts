import {} from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';

import type { AppRouterType } from '../../../backend/src/types/trpc';

export type {
  RouterInput as TrpcInput,
  RouterOutput as TrpcOutput,
} from '../../../backend/src/types/trpc';

export const trpc = createTRPCReact<AppRouterType>();
