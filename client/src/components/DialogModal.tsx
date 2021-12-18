import React from 'react';
import ReactDOM from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { mediaQueries } from '../style/media-queries';

const modalRoot = document.getElementById('modal-root');

type Props = { className?: string; hide?: () => void };

export const DialogModal: React.FC<Props> = ({ children, className, hide }) => {
  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.currentTarget !== event.target) {
      return;
    }
    hide?.();
  };

  if (!modalRoot) {
    return null;
  }

  return ReactDOM.createPortal(
    <S.Overlay onMouseDown={handleOverlayClick}>
      <S.Wrapper className={className}>{children}</S.Wrapper>;
    </S.Overlay>,
    modalRoot,
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
