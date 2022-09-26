import React from 'react';
import styled from 'styled-components';

type Props = { className?: string };

export const Popover: React.FC<React.PropsWithChildren<Props>> = (props) => {
  return (
    <>
      <S.Wrapper className={props.className}>{props.children}</S.Wrapper>
    </>
  );
};

const S = {
  Wrapper: styled.div`
    position: absolute;
    border: 1px grey solid;
    background-color: white;
    box-shadow: var(--base-shadow);
    transition: transform 100ms;

    &:empty {
      transform: scale(0);
    }
  `,
};
