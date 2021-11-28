import React from 'react';
import { createGlobalState } from 'react-hooks-global-state';
import styled from 'styled-components';
import { AnimatedValue } from './AnimatedValue';

type Props = { className?: string };

export const InfoBox: React.FC<Props> = (props) => {
  const [infoText] = useInfoBox();
  return <S.Wrapper {...props}>{infoText}</S.Wrapper>;
};

const S = {
  Wrapper: styled(AnimatedValue)`
    font-size: 1rem;
  `,
};

const initState = { info: null };
const { useGlobalState } = createGlobalState<{ info: string | null }>(initState);

export const useInfoBox = (): ReturnType<typeof useGlobalState> => useGlobalState('info');

export function useRegisterInfoBox(infoText: string): {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  title: string;
} {
  const [, setInfoText] = useInfoBox();

  const onMouseEnter = React.useCallback(
    () => setInfoText(infoText),
    [infoText, setInfoText],
  );

  const onMouseLeave = React.useCallback(() => setInfoText(null), [setInfoText]);

  return { onMouseEnter, onMouseLeave, title: infoText };
}
