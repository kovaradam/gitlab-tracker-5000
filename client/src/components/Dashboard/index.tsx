import React from 'react';
import {
  DataEntry,
  LabelRenderFunction,
} from 'react-minimal-pie-chart/types/commonTypes';
import styled from 'styled-components';
import { useUser } from '../../store/use-user';
import { FormStyle } from '../../style/form';
import { mediaQueries } from '../../style/media-queries';
import { getTimeValuesFromMillis } from '../../utils/time';
import { Spinner } from '../LoadingOverlay';
import { getDayTimelogs, getIssueTimelogs, getProjectTimelogs } from './data';
import { useProjectsQuery, useTimelogsQuery } from './queries';
import { createGitlabProjectId, dateToHtmlProp, formatTime } from './utils';
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

const dayInMs = 24 * 60 * 60 * 1000;

export const Dashboard: React.FC<React.PropsWithChildren<Props>> = ({ className }) => {
  const [now, weekInMs] = [Date.now(), 7 * dayInMs];
  const userDetails = useUser();
  const [from, setFrom] = React.useState<Date>(new Date(now - weekInMs));
  const [to, setTo] = React.useState<Date>(new Date(now + dayInMs));

  const timelogVariables = {
    username: userDetails?.username ?? '',
    startDate: from.toISOString(),
    endDate: to.toISOString(),
  };

  const timelogsResult = useTimelogsQuery(timelogVariables);

  const projectIds =
    timelogsResult.data?.timelogs?.nodes
      ?.filter((timelog) => timelog.issue)
      .map((timelog) => createGitlabProjectId(timelog.issue?.projectId ?? '')) ?? [];

  const projectsResult = useProjectsQuery({ ids: projectIds });

  const isLoading = timelogsResult.isLoading || projectsResult.isLoading;

  const [projectTimelogs, issueTimelogs, dayTimelogs] =
    React.useMemo((): Array<DataEntry>[] => {
      if (!projectsResult.data || !timelogsResult.data) {
        return [[], [], []];
      }
      return [
        getProjectTimelogs(projectsResult.data, timelogsResult.data),
        getIssueTimelogs(timelogsResult.data),
        getDayTimelogs(timelogsResult.data, { from, to }),
      ];
    }, [from, to, projectsResult.data, timelogsResult.data]);

  const renderPieLabel: LabelRenderFunction = ({
    dataEntry: { title, value },
  }): string => {
    if (!(title && value)) {
      return '';
    }
    const { hours, minutes } = getTimeValuesFromMillis(value);
    return `${title}: ${hours}h ${minutes}m`;
  };

  const [fromInputId, toInputId] = ['from-input', 'to-input'];
  const showOverlay =
    isLoading || !userDetails || timelogsResult.data?.timelogs?.nodes.length === 0;

  const timeInputInfo = 'Update filter';

  return (
    <S.Wrapper className={className}>
      <S.TimeRangeInputWrapper disabled={isLoading}>
        <label htmlFor={fromInputId}>from</label>
        <S.DateInput
          id={fromInputId}
          type="date"
          value={dateToHtmlProp(from)}
          onChange={({ target }): void =>
            setFrom(target.value ? new Date(target.value) : new Date())
          }
          max={dateToHtmlProp(to)}
          {...useRegisterInfoBox(timeInputInfo)}
        />
      </S.TimeRangeInputWrapper>
      <S.TimeRangeInputWrapper disabled={isLoading}>
        <label htmlFor={toInputId}>to</label>
        <S.DateInput
          type="date"
          id={toInputId}
          value={dateToHtmlProp(to)}
          onChange={({ target }): void =>
            setTo(target.value ? new Date(target.value) : new Date())
          }
          min={dateToHtmlProp(from)}
          max={dateToHtmlProp(new Date(now))}
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
            {!isLoading && projectTimelogs?.length === 0 ? (
              <S.NoDataMessage htmlFor={fromInputId}>No data available</S.NoDataMessage>
            ) : (
              <Spinner />
            )}
          </S.ChartOverlay>
        )}
        <S.RefreshButton
          disabled={isLoading}
          onClick={(): void => {
            timelogsResult.refetch();
          }}
        >
          Refresh
        </S.RefreshButton>
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
  TimeRangeInputWrapper: styled.fieldset`
    position: relative;
    background-color: white;
    align-self: center;
    justify-self: center;
    font-size: 1rem;
    width: min-content;
    z-index: 2;
    border: none;
    margin: 0;
    padding: 0;

    &[disabled] {
      z-index: 0;
    }

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
    gap: 5rem;
    overflow: auto;

    @media ${mediaQueries.desktop} {
      display: grid;
      gap: 1rem;
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
    height: min-content;
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
    z-index: 1;
    position: absolute;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #ffffff57;
    pointer-events: none;
    backdrop-filter: blur(2px);

    & svg {
      fill: var(--main-color);
    }
  `,
  RefreshButton: styled.button`
    width: min-content;
    place-self: center;
    margin: 1rem;
    padding: 1rem;
    background-color: white;

    @media ${mediaQueries.desktop} {
      position: absolute;
      right: var(--desktop-padding);
      bottom: 0;
    }
  `,
  NoDataMessage: styled.label`
    font-size: 1.5rem;
    font-weight: 400;
  `,
};
