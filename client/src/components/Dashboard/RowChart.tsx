import React from 'react';
import styled, { keyframes } from 'styled-components';
import { getTimeValuesFromMillis } from '../../utils/time';

export type Data = { color?: string; value: number; title?: string | number }[];

type Props = { className?: string; data?: Data };

function max(a: number, b: number): number {
  return a > b ? a : b;
}

export const RowChart: React.FC<Props> = ({ data, ...props }) => {
  if (!data) {
    return null;
  }
  const maxValue = data.map((data) => data.value).reduce(max, 0);

  return (
    <S.Wrapper {...props}>
      <S.ChartWrapper>
        {data
          .sort((prev, current) => current.value - prev.value)
          .map(({ color, value, title }) => (
            <S.RowWrapper title={formatTime(value)} key={title}>
              <S.RowVolume
                style={{ backgroundColor: color, width: `${(value / maxValue) * 100}%` }}
              />
              <S.RowLabel>{title}</S.RowLabel>
              <S.AxisLabel>{formatTime(value)}</S.AxisLabel>
            </S.RowWrapper>
          ))}
      </S.ChartWrapper>
    </S.Wrapper>
  );
};

function formatTime(time: number): string {
  const { hours, minutes } = getTimeValuesFromMillis(time);
  return `${hours}h ${minutes}m`;
}

const S = {
  Wrapper: styled.div`
    --axis-margin: 5rem;
  `,
  ChartWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: baseline;
    justify-content: space-evenly;
    border: dashed grey;
    border-width: 0 0 2px 2px;
    padding: 2px;
    background-color: #ffffff2b;
    gap: 1rem;
    scroll-margin: 50px 0 0 50px;
    margin-left: var(--axis-margin);
    width: calc(98% - var(--axis-margin));
    min-height: 100%;
  `,
  RowWrapper: styled.span`
    position: relative;
    display: flex;
    width: 100%;
    align-items: center;
  `,
  RowVolume: styled.div`
    height: 100%;
    transform-origin: left;
    opacity: 0.7;
    height: 2rem;

    animation: ${keyframes`
    from {transform: scaleX(0%);}
    to {transform: scaleX(100%);}
    `} 500ms ease-out;
  `,
  RowLabel: styled.span`
    position: absolute;
    left: 2px;
    font-size: 1rem;
    color: #444444;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  `,
  AxisLabel: styled.span`
    position: absolute;
    right: 100%;
    padding-right: 0.5rem;
    font-size: 1rem;
    color: #444444;
    text-align: right;
    white-space: nowrap;
  `,
};
