import React from 'react';
import styled from 'styled-components';
import { MdOutlinePause } from 'react-icons/md';
import { getTimeValuesFromMillis } from '../utils/time';

type Props = { timestamp: number | null; stopTimer: () => void; className?: string };

export const Timer: React.FC<Props> = ({ timestamp, stopTimer, ...props }) => {
  const [time, setTime] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!timestamp) {
      setTime(null);
      return;
    }
    const [update, timeout] = [
      (): void => setTime(new Date().getTime() - timestamp),
      1000,
    ];
    update();
    const timeoutId = setInterval(update, timeout);
    return (): void => {
      clearInterval(timeoutId);
    };
  }, [timestamp]);

  return (
    <S.Wrapper data-visible={timestamp !== null} {...props}>
      <S.Time>{formatTime(time ?? 0)}</S.Time>
      <S.StopButton onClick={stopTimer} disabled={timestamp === null}>
        <MdOutlinePause />
      </S.StopButton>
    </S.Wrapper>
  );
};

function formatTime(timestamp: number): string {
  const { hours, minutes, seconds } = getTimeValuesFromMillis(timestamp);
  const withZeroPad = (value: number): string => leftPad(String(value), 2, '0');
  return `${withZeroPad(hours)}:${withZeroPad(minutes)}:${withZeroPad(seconds)}`;
}

function leftPad(value: string, finalSize: number, symbol: string): string {
  let paddedValue = value;
  for (let i = 0; i < finalSize - value.length; i++) {
    paddedValue = symbol.concat(paddedValue);
  }
  return paddedValue;
}

const S = {
  Wrapper: styled.span`
    --default-transform: translate(-50%);
    position: fixed;
    left: 50vw;
    transform: var(--default-transform);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80vw;
    height: 5rem;
    border: 2px dashed var(--main-color);
    box-shadow: var(--base-shadow);
    background-color: white;
    gap: 1rem;

    &[data-visible='false'] {
      transform: var(--default-transform) translateY(160%);
    }

    transition: all 200ms;
  `,
  Time: styled.code`
    font-size: 2rem;
  `,
  StopButton: styled.button`
    font-size: 1.5rem;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.5rem;
    border: 1px solid var(--main-color);
    color: var(--main-color);
  `,
};
