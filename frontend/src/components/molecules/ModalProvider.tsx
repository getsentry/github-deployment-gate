import React from 'react';

import { useModals } from '../../state/modals';
import FailureModal from './FailureModal';
import SuccessModal from './SuccessModal';

export function ModalProvider() {
  const { isSuccessModalOpen, isFailureModalOpen, message, hide } = useModals();
  return (
    <>
      {isSuccessModalOpen && <SuccessModal onClose={hide} message={message} />}

      {isFailureModalOpen && <FailureModal onClose={hide} message={message} />}
    </>
  );
}
