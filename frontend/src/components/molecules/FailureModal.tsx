import styled from '@emotion/styled';
import React from 'react';
import { FaTimesCircle } from 'react-icons/fa';

interface Props {
  onClose: () => void;
  message?: string;
}

const FailureModal = ({ onClose, message }: Props) => {
  return (
    <ModalWrapper>
      <Failure>
        <FaTimesCircle style={{ fontSize: '3rem', color: '#e73a3a' }} />
        <h2>{message ?? 'Something went wrong'}</h2>
        <CloseButton onClick={onClose}>OK</CloseButton>
      </Failure>
    </ModalWrapper>
  );
};

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Failure = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: white;
  padding: 50px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  border: 2px solid #b9bec2;
`;

const CloseButton = styled.button`
  padding: 8px 16px;
  background-color: #b9bec2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
`;

export default FailureModal;
