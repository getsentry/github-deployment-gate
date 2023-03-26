import React, { useState } from 'react';

import type { TrpcOutput } from '../../services/trpc';
import { trpc } from '../../services/trpc';
import { useModals } from '../../state/modals';
import Button from '../atoms/Button';

interface GithubRepoRowProps {
  repo: TrpcOutput['github']['repositories'][number];
}

export function GithubRepoRow(props: GithubRepoRowProps) {
  const { repo } = props;

  const { mutateAsync: updateWaitTime } = trpc.github.updateWaitTime.useMutation();
  const { showSuccessModal, showFailureModal } = useModals();
  const [waitTime, setWaitTime] = useState(repo.waitPeriodToCheckForIssue);

  const handleUpdate = () => {
    updateWaitTime({
      repoId: repo.id,
      waitTime,
    })
      .then((response) => {
        response ? showSuccessModal() : showFailureModal('Unable to update wait time.');
      })
      .catch((error) => {
        showFailureModal(error.message);
      });
  };

  return (
    <div key={repo.id} style={{ display: 'flex' }}>
      <div
        style={{
          width: '50%',
          textAlign: 'center',
          paddingTop: '1rem',
        }}
      >
        <label style={{ fontSize: '20px', margin: '1rem' }}>{repo.name}</label>
      </div>
      <div style={{ width: '25%', textAlign: 'center' }}>
        <input
          style={{ minHeight: '38px', margin: '1rem' }}
          type="number"
          id="wait-time"
          value={waitTime}
          onChange={(ev) => setWaitTime(Number(ev.target.value))}
        />
      </div>
      <div
        style={{
          width: '25%',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Button
          id={'update' + repo.id}
          style={{ minHeight: '38px', margin: '1rem', width: '8rem' }}
          onClick={handleUpdate}
        >
          Update
        </Button>
      </div>
    </div>
  );
}
