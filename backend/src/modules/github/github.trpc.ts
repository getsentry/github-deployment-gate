import { TRPCError } from '@trpc/server';
import { InferAttributes, Op } from 'sequelize';
import zod from 'zod';

import DeploymentProtectionRuleRequest from '../../models/DeploymentProtectionRuleRequest.model';
import GithubRepo from '../../models/GithubRepo.model';
import SentryInstallation from '../../models/SentryInstallation.model';
import User from '../../models/User.model';
import { trpcProcedure, trpcRouter } from '../../modules/trpc/trpc.context';
import { DeploymentProtectionRuleStatus } from '../../types/DeploymentRule.dto';
import {
  callGHPassFailAPI,
  generateGHAppJWT,
  getGithubRepos,
  getUserByGHHandle,
} from './github.utils';

export const ghInternalRoutes = trpcRouter({
  repositories: trpcProcedure
    .input(zod.object({ githubHandle: zod.string() }))
    .query(async ({ input }) => {
      const user = await getUserByGHHandle(input.githubHandle);
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No such user',
        });
      }
      return getGithubRepos(user.id);
    }),

  sentryInstallations: trpcProcedure
    .input(zod.object({ githubHandle: zod.string() }))
    .query(async ({ input }) => {
      const user = await getUserByGHHandle(input.githubHandle);
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No such user',
        });
      }

      const sentryInstallations = await SentryInstallation.findAll({
        where: {
          userId: user.id,
        },
      }).then(sentryInstallations =>
        (sentryInstallations ?? []).map<InferAttributes<SentryInstallation>>(
          sentryInstallation => sentryInstallation.get()
        )
      );
      return sentryInstallations;
    }),

  approveRejectGate: trpcProcedure
    .input(
      zod.object({
        releaseId: zod.string(),
        status: zod.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { releaseId, status } = input;
      if (!status || !releaseId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Please provide status and releaseId',
        });
      }

      if (
        status != DeploymentProtectionRuleStatus.APPROVED &&
        status != DeploymentProtectionRuleStatus.REJECTED
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid status',
        });
      }

      const deploymentProtectionRuleRequest =
        await DeploymentProtectionRuleRequest.findOne({
          where: {
            sha: releaseId,
            status: DeploymentProtectionRuleStatus.REQUESTED,
          },
        }).then(
          deploymentProtectionRuleRequest =>
            deploymentProtectionRuleRequest?.get() as InferAttributes<DeploymentProtectionRuleRequest>
        );

      if (!deploymentProtectionRuleRequest) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No such release',
        });
      }

      await callGHPassFailAPI(
        deploymentProtectionRuleRequest.installationId,
        deploymentProtectionRuleRequest.deploymentCallbackUrl,
        deploymentProtectionRuleRequest.environment,
        status,
        `Manually ${status}`
      );

      return true;
    }),

  deploymentRequests: trpcProcedure
    .input(zod.object({ githubHandle: zod.string() }))
    .query(async ({ input }) => {
      const user = await User.findOne({
        where: {
          githubHandle: input.githubHandle,
        },
      }).then(user => user?.get() as InferAttributes<User>);

      if (!user) {
        throw new Error('Invalid githubHandle');
      }

      const githubRepos = await GithubRepo.findAll({
        where: {
          userId: user.id,
        },
      }).then(githubRepos =>
        (githubRepos ?? []).map<InferAttributes<GithubRepo>>(repo => repo.get())
      );
      if (!githubRepos?.length) {
        return [];
      }

      return DeploymentProtectionRuleRequest.findAll({
        where: {
          githubRepoId: {
            [Op.in]: githubRepos.map(repo => repo.id),
          },
          status: DeploymentProtectionRuleStatus.REQUESTED,
        },
      }).then(depReqs =>
        (depReqs ?? []).map<InferAttributes<DeploymentProtectionRuleRequest>>(depReq =>
          depReq.get()
        )
      );
    }),

  updateWaitTime: trpcProcedure
    .input(zod.object({ repoId: zod.number(), waitTime: zod.number() }))
    .mutation(async ({ input }) => {
      const { repoId, waitTime } = input;
      const githubRepo = await GithubRepo.findOne({
        where: {
          id: repoId,
        },
      });

      if (!githubRepo) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid repoId',
        });
      }

      await githubRepo.update({ waitPeriodToCheckForIssue: waitTime });
      return true;
    }),

  generateGHAppJWT: trpcProcedure.query(async () => {
    return generateGHAppJWT();
  }),
});
