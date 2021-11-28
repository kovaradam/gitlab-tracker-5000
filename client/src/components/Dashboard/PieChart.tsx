import React from 'react';
import { PieChart as PieChartLib } from 'react-minimal-pie-chart';
import styled from 'styled-components';
import { ChartProps } from './ChartFactory';

type Props = ChartProps;

export const PieChart: React.FC<Props> = ({
  className,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  return (
    <S.Wrapper
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
    >
      <PieChartLib {...props} />
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.div``,
};
