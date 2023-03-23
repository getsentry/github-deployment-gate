import styled from '@emotion/styled';
import React from 'react';
import {FaCheckCircle} from 'react-icons/fa';

interface Props {
  onClose: () => void;
}

const SuccessModal = ({onClose}: Props) => {
  return (
    <ModalWrapper>
      <Success>
        <FaCheckCircle style={{color: '2ecc71', fontSize: '3rem'}} />
        <h2>Success!</h2>
        <CloseButton onClick={onClose}>OK</CloseButton>
      </Success>
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

const Success = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  border: 2px solid #b9bec2;
  width: 250px;
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

export default SuccessModal;
