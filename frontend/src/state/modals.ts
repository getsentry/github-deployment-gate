import { atom, useRecoilState } from 'recoil';

import { StateKeys } from './state-keys.constants';

enum ModalTypes {
  Success = 'Success',
  Failure = 'Failure',
}

const modalsState = atom<{
  type: ModalTypes;
  message?: string;
} | null>({
  key: StateKeys.Modals,
  default: null,
});

export function useModals() {
  const [state, setModals] = useRecoilState(modalsState);

  return {
    isSuccessModalOpen: state?.type === ModalTypes.Success,
    isFailureModalOpen: state?.type === ModalTypes.Failure,
    message: state?.message,
    showSuccessModal: (message?: string) =>
      setModals({ type: ModalTypes.Success, message }),
    showFailureModal: (message?: string) =>
      setModals({ type: ModalTypes.Failure, message }),
    hide: () => setModals(null),
  };
}
