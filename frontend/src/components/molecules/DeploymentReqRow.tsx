import React from 'react';

import type { TrpcOutput } from '../../services/trpc';
import Button from '../atoms/Button';

interface DeploymentRequestRowProps {
  deploymentRequest: TrpcOutput['github']['deploymentRequests'][number];
  name: string;
  onSubmit: (sha: string, action: string) => void;
}

export function DeploymentRequestRow(props: DeploymentRequestRowProps) {
  const { deploymentRequest, name, onSubmit } = props;

  return (
    <div key={deploymentRequest.id} style={{ display: 'flex' }}>
      <div
        style={{
          width: '30%',
          textAlign: 'center',
          paddingTop: '1rem',
        }}
      >
        <label style={{ fontSize: '12px', margin: '1rem' }}>{name}</label>
      </div>
      <div
        style={{
          width: '30%',
          textAlign: 'center',
          paddingTop: '1rem',
        }}
      >
        <label style={{ fontSize: '12px', margin: '1rem' }}>
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
        <label style={{ fontSize: '12px', margin: '1rem' }}>
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
          className="primary"
          style={{
            minHeight: '38px',
            margin: '1rem',
            width: '6rem',
          }}
          onClick={() => onSubmit(deploymentRequest.sha, 'approved')}
        >
          Approve
        </Button>
        <Button
          id={'reject-' + deploymentRequest.id}
          className="secondary"
          style={{
            minHeight: '38px',
            margin: '1rem',
            width: '6rem',
          }}
          onClick={() => onSubmit(deploymentRequest.sha, 'rejected')}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
