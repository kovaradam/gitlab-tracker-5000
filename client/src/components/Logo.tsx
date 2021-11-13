import React from 'react';
import styled from 'styled-components';

type Props = { className?: string };

export const Logo: React.FC<Props> = ({ className }) => {
  return (
    <S.Wrapper className={className}>
      <S.Heading>
        GitLab Tracker <S.Number>5000</S.Number>
      </S.Heading>
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.span`
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--main-color);
  `,
  Heading: styled.h1`
    font-size: 1.7rem;
    font-weight: 600;
    width: 70%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    white-space: nowrap;
  `,
  Number: styled.i`
    font-size: 0.8em;
    text-decoration: overline;
  `,
};
