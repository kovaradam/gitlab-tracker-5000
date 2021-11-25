import React from 'react';
import styled, { keyframes } from 'styled-components';
import { mediaQueries } from '../style/media-queries';

export const DialogModal: React.FC<{ className?: string; hide?: () => void }> = ({
  children,
  className,
  hide,
}) => {
  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.currentTarget !== event.target) {
      return;
    }
    hide?.();
  };
  return (
    <S.Overlay onClick={handleOverlayClick}>
      <S.Wrapper className={className}>{children}</S.Wrapper>;
    </S.Overlay>
  );
};

const S = {
  Overlay: styled.div`
    position: absolute;
    width: 100vw;
    height: 100vh;
    background-color: #80808034;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 3;
  `,
  Wrapper: styled.div`
    position: relative;
    width: 80%;
    background-color: white;
    border: 1px solid var(--main-color);
    box-shadow: var(--base-shadow);
    display: flex;
    flex-direction: column;
    z-index: 1;
    animation: ${keyframes`
    from{transform:scale(0.8);}
    to{transform:scale(1);}
    `} 200ms forwards;
    @media ${mediaQueries.create(400)} {
      max-width: 20rem;
    }
  `,
};
