import React from 'react';
import { LabelRenderFunction } from 'react-minimal-pie-chart/types/commonTypes';
import styled from 'styled-components';
import { useUser } from '../../store/use-user';
import { FormStyle } from '../../style/form';
import { mediaQueries } from '../../style/media-queries';
import { getTimeValuesFromMillis } from '../../utils/time';
import { Spinner } from '../LoadingOverlay';
import { getDayTimelogs, getIssueTimelogs, getProjectTimelogs } from './data';
import { Timelog } from './queries';
import { dateToHtmlProp, formatTime } from './utils';
import { useIssues } from './use-issues';
import { ChartFactory } from './ChartFactory';
import { useRegisterInfoBox } from '../InfoBox';

type Props = { className?: string };

const pieChartConfig = {
  segmentsShift: 1,
  radius: 42,
  lineWidth: 90,
  labelPosition: 62,
};

const placeholderData = [30, 20, 40, 10].map((value, index) => ({
  value,
  color: index % 2 === 0 ? '#ebe5e5' : 'var(--grey)',
}));

export const Dashboard: React.FC<Props> = ({ className }) => {
  const [now, week] = [new Date(), 7 * 24 * 60 * 60 * 1000];
  const userDetails = useUser();
  const [from, setFrom] = React.useState<Date>(new Date(now.getTime() - week));
  const [to, setTo] = React.useState<Date>(now);
  const [fetchTimelogData, { data, isLoading }] = useIssues();

  React.useEffect(() => {
    fetchTimelogData();
  }, [fetchTimelogData]);

  const checkTimelog = React.useCallback(
    (timelog: Timelog) => {
      const { spentAt, user } = timelog;
      const spentAtDateTime = new Date(spentAt).getTime();
      const timeCheck =
        spentAtDateTime >= from.getTime() && spentAtDateTime <= to.getTime();
      return user.username === userDetails?.username && timeCheck;
    },
    [from, to, userDetails],
  );

  const [projectTimelogs, issueTimelogs, dayTimelogs] = React.useMemo(
    () =>
      [getProjectTimelogs, getIssueTimelogs, getDayTimelogs].map((t) =>
        t(data, checkTimelog),
      ),
    [checkTimelog, data],
  );

  const renderPieLabel: LabelRenderFunction = ({
    dataEntry: { title, value },
  }): string => {
    if (!(title && value)) {
      return '';
    }
    const { hours, minutes } = getTimeValuesFromMillis(value);
    return `${title}: ${hours}h ${minutes}m`;
  };

  const fromInputId = 'from-input';
  const showOverlay = isLoading || !userDetails || projectTimelogs?.length === 0;

  const timeInputInfo = 'Update filter';

  return (
    <S.Wrapper className={className}>
      <S.TimeRangeInputWrapper>
        <label>from</label>
        <S.DateInput
          id={fromInputId}
          type="date"
          value={dateToHtmlProp(from)}
          onChange={({ target }): void => setFrom(new Date(target.value))}
          max={dateToHtmlProp(to)}
          disabled={isLoading}
          {...useRegisterInfoBox(timeInputInfo)}
        />
      </S.TimeRangeInputWrapper>
      <S.TimeRangeInputWrapper>
        <label>to</label>
        <S.DateInput
          type="date"
          value={dateToHtmlProp(to)}
          onChange={({ target }): void => setTo(new Date(target.value))}
          min={dateToHtmlProp(from)}
          max={dateToHtmlProp(now)}
          disabled={isLoading}
          {...useRegisterInfoBox(timeInputInfo)}
        />
      </S.TimeRangeInputWrapper>
      <S.ChartWrapper>
        <S.PieChart
          data={projectTimelogs ?? placeholderData}
          label={renderPieLabel}
          animate
          info="Total time spent on project"
        />

        <S.BarChart
          data={issueTimelogs ?? placeholderData}
          info="Total time spent on particular issue"
        />
        <S.LineChart
          data={dayTimelogs ?? placeholderData}
          info="Time spent on given day"
        />
        {showOverlay && (
          <S.ChartOverlay>
            {projectTimelogs?.length === 0 ? (
              <S.NoDataMessage htmlFor={fromInputId}>No data available</S.NoDataMessage>
            ) : (
              <Spinner />
            )}
          </S.ChartOverlay>
        )}
      </S.ChartWrapper>
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.div`
    position: relative;
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 2fr;
    grid-template-rows: 6rem 1fr;
  `,
  TimeRangeInputWrapper: styled.span`
    position: relative;
    background-color: white;
    align-self: center;
    justify-self: center;
    font-size: 1rem;
    width: min-content;
    &:first-child {
      grid-column: 1 / 3;
    }

    & > label {
      position: absolute;
      bottom: 100%;
      color: var(--main-color);
      margin: 5px;
    }

    @media ${mediaQueries.desktop} {
      &:first-child {
        grid-column: 1 / 2;
      }
    }
  `,
  DateInput: styled(FormStyle.Input)`
    padding: 0.5rem 5px;
    box-shadow: var(--base-shadow);
    border-color: var(--main-color);
    background-color: white;
  `,
  ChartWrapper: styled.section`
    grid-area: 2 / 1 / 3 / 4;
    display: grid;
    gap: 2rem;
    overflow: auto;

    @media ${mediaQueries.desktop} {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 50% 50%;
    }
  `,
  PieChart: styled(ChartFactory).attrs({ ...pieChartConfig, type: 'pie' })`
    & text {
      font-size: 0.3rem;
      fill: white;
    }
  `,
  BarChart: styled(ChartFactory).attrs({ formatValue: formatTime, type: 'bar' })`
    height: min-content;
    width: 90%;
    gap: 1rem;

    @media ${mediaQueries.desktop} {
      grid-column: 2;
      --size: 80%;
      height: var(--size);
      width: var(--size);
      box-sizing: border-box;
      place-self: center;
      overflow-y: auto;
      overflow-x: visible;
    }
  `,
  LineChart: styled(ChartFactory).attrs({ formatValue: formatTime, type: 'line' })`
    height: min-content;
    width: 90%;
    height: 20rem;
    gap: 1rem;
    align-self: start;
    justify-self: center;

    @media ${mediaQueries.desktop} {
      grid-row: 2;
      grid-column: 1 / 3;
      --size: 80%;
      height: var(--size);
      width: var(--size);
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      max-width: 1200px;
    }
  `,
  ChartOverlay: styled.div`
    top: 0;
    position: absolute;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #ffffff57;

    & svg {
      fill: var(--main-color);
    }
  `,
  NoDataMessage: styled.label`
    font-size: 1.5rem;
    font-weight: 400;
  `,
};
