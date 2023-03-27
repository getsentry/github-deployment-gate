import React from 'react';

import type { TrpcOutput } from '../../services/trpc';
import { trpc } from '../../services/trpc';
import { useModals } from '../../state/modals';
import { DeploymentRequestRow } from '../molecules/DeploymentReqRow';

interface PendingDeploymentRequestsProps {
  deploymentRequests: TrpcOutput['github']['deploymentRequests'];
  repos: TrpcOutput['github']['repositories'];
}

export function PendingDeploymentRequests(props: PendingDeploymentRequestsProps) {
  const { deploymentRequests, repos } = props;
  const { data: userProfile } = trpc.auth.profile.useQuery();

  const { mutateAsync: approveRejectGate } = trpc.github.approveRejectGate.useMutation();
  const { showSuccessModal, showFailureModal } = useModals();
  const utils = trpc.useContext();

  const handleApproveReject = (sha: string, action: string) => {
    approveRejectGate({
      releaseId: sha,
      status: action,
    })
      .then((response) => {
        if (response) {
          utils.github.deploymentRequests.setData(
            {
              githubHandle: userProfile?.githubHandle ?? '',
            },
            (depRequests) => depRequests?.filter((depReq) => depReq.sha !== sha)
          );
          showSuccessModal(action.charAt(0).toUpperCase() + action.slice(1));
        } else {
          showFailureModal('Unable to approve/reject.');
        }
      })
      .catch((error) => {
        showFailureModal(error.message);
      });
  };

  return (
    <>
      <h3>Pending Deployment Requests</h3>
      <div>
        <div style={{ display: 'flex' }}>
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
        {deploymentRequests?.map((deploymentRequest) => {
          return (
            <DeploymentRequestRow
              key={deploymentRequest.id}
              name={
                repos.find((repo) => repo.id == deploymentRequest.githubRepoId)?.name ??
                '<untitled>'
              }
              deploymentRequest={deploymentRequest}
              onSubmit={handleApproveReject}
            />
          );
        })}
      </div>
    </>
  );
}
