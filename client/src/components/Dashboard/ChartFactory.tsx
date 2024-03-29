import React from 'react';
import type {
  DataEntry,
  LabelRenderFunction,
} from 'react-minimal-pie-chart/types/commonTypes';
import { useRegisterInfoBox } from '../InfoBox';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { PieChart } from './PieChart';

type ChartData = (DataEntry & {
  color?: string;
  value: number;
  title?: string | number;
  url?: string;
})[];

type Props = { type: 'pie' | 'bar' | 'line'; info: string };

export type ChartProps = {
  className?: string;
  data?: ChartData;
  formatValue?: (value: number) => string;
  label?: LabelRenderFunction;
  animate?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const ChartFactory: React.FC<React.PropsWithChildren<Props & ChartProps>> = ({
  type,
  info,
  ...chartProps
}) => {
  const registerInfoBox = useRegisterInfoBox(info);
  const Chart = ((): React.FC<React.PropsWithChildren<unknown>> => {
    switch (type) {
      case 'pie':
        return PieChart;
      case 'bar':
        return BarChart;
      case 'line':
        return LineChart;
    }
  })();

  return <Chart {...chartProps} {...registerInfoBox} />;
};
