import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ImSpinner8 } from 'react-icons/im';

export const LoadingOverlay: React.FC = () => {
  return (
    <S.Wrapper>
      <S.Icon />
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.div`
    position: absolute;
    width: 100vw;
    height: 100vh;
    background-color: #00000075;
    box-shadow: 0 0 131px 0 #0000005e inset;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
  `,
  Icon: styled(ImSpinner8)`
    color: white;
    font-size: 3rem;
    animation: ${keyframes`from{transform:rotate(0deg)}to{transform:rotate(359deg)}`} 1s
      linear infinite; ;
  `,
};

export const Spinner = S.Icon;
