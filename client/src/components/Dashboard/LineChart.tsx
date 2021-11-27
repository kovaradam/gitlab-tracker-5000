import React from 'react';
import styled from 'styled-components';
import { Props } from './BarChart';
import { max } from './utils';

const svgFraction = 10;

export const LineChart: React.FC<Props> = ({ data, ...props }) => {
  if (!data) {
    return null;
  }

  const formatValue = (value: number): string => {
    return props.formatValue?.(value) ?? String(value);
  };

  const maxValue = data.map((data) => data.value).reduce(max, 0);

  const points = data.map(({ value, title }, idx, { length }) => ({
    left: ((idx + 1) / (length + 1)) * 100,
    top: (value / maxValue) * 100,
    title,
    value,
  }));

  const graphPath = padPath(
    points.reduce((prev, { left, top }) => `${prev}${printPoint(left, top)}, `, ''),
  );

  const valueLinePaths = points.map(
    ({ left, top }) => `${printPoint(left, top)}, ${printPoint(left, 0)}`,
  );

  const axisLabels = points.map(({ left, title }) => ({
    left,
    title,
  }));

  const dataLabels = points.map(({ left, top, value }) => ({
    left,
    top: 100 - top,
    title: formatValue(value),
  }));

  const mainColor = data[0]?.color || 'var(--chart-grey)';
  console.log(mainColor);

  return (
    <S.Wrapper {...props}>
      <S.ChartWrapper>
        <S.Chart
          viewBox={`0 0 ${svgFraction * 100} ${svgFraction * 100}`}
          preserveAspectRatio="none"
        >
          <S.Graph points={graphPath} style={{ stroke: mainColor }} />
          {valueLinePaths.map((points) => (
            <S.ValueLine points={points} key={points} />
          ))}
          <S.AxisLine points={`${printPoint(0, 0)}, ${printPoint(100, 0)}`} />
        </S.Chart>
        {axisLabels.map(({ left, title }) => (
          <S.AxisLabel style={{ left: `${left}%`, top: '101%' }} key={`${title}${left}`}>
            {title}
          </S.AxisLabel>
        ))}
        {dataLabels.map(({ left, top, title }) => (
          <S.DataLabel
            style={{ left: `${left}%`, top: `${top}%`, color: mainColor }}
            key={`${left}${top}${title}`}
            title={title}
          >
            {title}
          </S.DataLabel>
        ))}
      </S.ChartWrapper>
    </S.Wrapper>
  );
};

function printPoint(left: number, top: number, unit = ''): string {
  return `${left * svgFraction}${unit} ${(100 - top) * svgFraction}${unit}`;
}

function padPath(path: string): string {
  return `${printPoint(0, 0)}, ${path}${printPoint(100, 0)}`;
}

const S = {
  Wrapper: styled.div``,
  ChartWrapper: styled.div`
    position: relative;
    width: 100%;
    height: 60%;
    padding: 2px;
  `,
  Chart: styled.svg`
    width: 100%;
    height: 100%;
  `,
  Graph: styled.polyline`
    stroke: var(--main-color);
    fill: none;
    stroke-width: 7px;
    stroke-linejoin: round;
    stroke-linecap: round;
  `,
  ValueLine: styled.polyline`
    stroke: var(--chart-grey);
    fill: none;
    stroke-width: 2px;
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-dasharray: 18px;
  `,
  AxisLine: styled.polyline`
    stroke: var(--chart-grey);
    fill: none;
    stroke-width: 2px;
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-dasharray: 10px;
  `,
  AxisLabel: styled.span`
    position: absolute;
    font-size: 0.8rem;
    color: var(--chart-grey);
    transform: translateX(-50%);
    cursor: default;
  `,
  DataLabel: styled.span`
    position: absolute;
    font-size: 0.8rem;
    transform: translateX(-50%) translateY(-100%);
    cursor: default;
  `,
};
