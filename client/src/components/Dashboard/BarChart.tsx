import React from 'react';
import styled, { keyframes } from 'styled-components';
import { max } from './utils';

export type Data = {
  color?: string;
  value: number;
  title?: string | number;
  url?: string;
}[];

export type Props = {
  className?: string;
  data?: Data;
  formatValue?: (value: number) => string;
};

export const BarChart: React.FC<Props> = ({ data, ...props }) => {
  if (!data) {
    return null;
  }
  const maxValue = data.map((data) => data.value).reduce(max, 0);

  const formatValue = (value: number): string => {
    return props.formatValue?.(value) ?? String(value);
  };

  return (
    <S.Wrapper {...props}>
      <S.ChartWrapper>
        {data
          .sort((prev, current) => current.value - prev.value)
          .map(({ color, value, title, url }) => (
            <S.BarWrapper title={formatValue(value)} key={`${title}${color}${value}`}>
              <S.BarVolume
                style={{ backgroundColor: color, width: `${(value / maxValue) * 100}%` }}
              />
              <S.BarTitle href={url} rel="noopener noreferrer" target="_blank">
                {title}
              </S.BarTitle>
              <S.AxisLabel style={{ color }}>{formatValue(value)}</S.AxisLabel>
            </S.BarWrapper>
          ))}
      </S.ChartWrapper>
    </S.Wrapper>
  );
};

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
    border-width: 0 0 0px 1px;
    padding: 2px;
    background-color: #ffffff2b;
    gap: 1rem;
    scroll-margin: 50px 0 0 50px;
    margin-left: var(--axis-margin);
    width: calc(98% - var(--axis-margin));
    min-height: 98%;
  `,
  BarWrapper: styled.span`
    position: relative;
    display: flex;
    width: 100%;
    align-items: center;
  `,
  BarVolume: styled.div`
    transform-origin: left;
    height: 2rem;

    animation: ${keyframes`
    from {transform: scaleX(0%);}
    to {transform: scaleX(100%);}
    `} 500ms ease-out;
  `,
  BarTitle: styled.a`
    position: absolute;
    left: 2px;
    font-size: 1rem;
    color: #444444;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    &:hover {
      background-color: transparent;
      box-shadow: none;
    }

    &:not([href]) {
      pointer-events: none;
    }
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
