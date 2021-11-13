import React from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import { LabelRenderFunction } from 'react-minimal-pie-chart/types/commonTypes';
import styled from 'styled-components';
import { useQuery } from '../../store/use-query';
import { useUser } from '../../store/use-user';
import { FormStyle } from '../../style/form';
import { getTimeValuesFromMillis } from '../../utils/time';
import { Spinner } from '../LoadingOverlay';
import { GetTimelogsResponse, GET_TIMELOGS } from './queries';
import { dateToHtmlProp } from './utils';

type Props = { className?: string };

const colors = ['var(--main-color)', 'tomato', '#ff8a50'];

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

const [now, week] = [new Date(), 7 * 24 * 60 * 60 * 1000];

export const Dashboard: React.FC<Props> = ({ className }) => {
  const userDetails = useUser();
  const [from, setFrom] = React.useState<Date>(new Date(now.getTime() - week));
  const [to, setTo] = React.useState<Date>(now);
  const [fetchTimelogData, { data, isLoading }] =
    useQuery<GetTimelogsResponse>(GET_TIMELOGS);

  React.useEffect(() => {
    if (!userDetails) {
      return;
    }
    const { username } = userDetails;
    fetchTimelogData({ username });
  }, [fetchTimelogData, userDetails]);

  const checkTimelog = React.useCallback(
    (timelog: { spentAt: string; user: { username: string } }) => {
      const { spentAt, user } = timelog;
      const spentAtDateTime = new Date(spentAt).getTime();
      const timeCheck =
        spentAtDateTime >= from.getTime() && spentAtDateTime <= to.getTime();
      return user.username === userDetails?.username && timeCheck;
    },
    [from, to, userDetails],
  );

  const timelogs = React.useMemo(
    () =>
      data?.projects.nodes
        .filter(({ issues }) => issues.nodes.length > 0)
        .map(({ issues }) => issues.nodes)
        .flat()
        .map(
          ({ timelogs, iid }) =>
            [
              iid,
              timelogs.nodes
                .filter(checkTimelog)
                .map(({ timeSpent }) => timeSpent * 1000)
                .reduce((prev, current) => prev + current, 0),
            ] as [string, number],
        )
        .filter(([, totalTimeSpent]) => totalTimeSpent !== 0)
        .map(([iid, totalTimeSpent], index) => ({
          title: iid,
          value: totalTimeSpent,
          color: colors[index % colors.length],
        })),
    [checkTimelog, data],
  );

  const renderLabel: LabelRenderFunction = ({ dataEntry: { title, value } }): string => {
    const { hours, minutes } = getTimeValuesFromMillis(value);
    return `#${title}: ${hours}h ${minutes}m`;
  };

  const fromInputId = 'from-input';

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
        />
      </S.TimeRangeInputWrapper>
      <S.ChartWrapper>
        {timelogs?.length === 0 ? (
          <S.NoDataMessage htmlFor={fromInputId}>No data available</S.NoDataMessage>
        ) : isLoading || !userDetails ? (
          <>
            <S.PieChart data={placeholderData} />
            <S.PieChartOverlay>
              <Spinner />
            </S.PieChartOverlay>
          </>
        ) : (
          <S.PieChart data={timelogs} label={renderLabel} animate />
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
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 4rem 1fr;
  `,
  TimeRangeInputWrapper: styled.span`
    position: relative;
    background-color: white;
    align-self: end;
    justify-self: center;
    font-size: 1rem;
    width: min-content;

    & > label {
      position: absolute;
      bottom: 100%;
      color: var(--main-color);
      margin: 5px;
    }
  `,
  DateInput: styled(FormStyle.Input)`
    padding: 0.5rem 5px;
    box-shadow: var(--base-shadow);
    border-color: var(--main-color);
    background-color: white;
  `,
  ChartWrapper: styled.section`
    grid-area: 2 / 1 / 3 / 3;
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  PieChart: styled(PieChart).attrs(pieChartConfig)`
    height: 90vmin;
    & text {
      font-size: 0.3rem;
      fill: white;
    }
  `,
  PieChartOverlay: styled.div`
    top: 0;
    position: absolute;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    & svg {
      fill: var(--main-color);
    }
  `,
  NoDataMessage: styled.label`
    font-size: 1.5rem;
    font-weight: 400;
  `,
};
