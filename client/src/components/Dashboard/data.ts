import { DataEntry } from 'react-minimal-pie-chart/types/commonTypes';
import { formatTitle } from '../../utils/issues';
import { GetTimelogsResponse, Timelog } from './queries';

const colors = ['var(--main-color)', 'tomato', '#ff8a50'];

type DataTransformer = (
  data: GetTimelogsResponse | null,
  checkTimelog: (timelog: Timelog) => boolean,
) => DataEntry[] | undefined;

export const getProjectTimelogs: DataTransformer = (data, checkTimelog) => {
  return data?.projects.nodes
    .filter(({ issues }) => issues.nodes.length > 0)
    .map(
      ({ issues, name }) =>
        [
          name,
          issues.nodes
            .map(({ timelogs }) =>
              timelogs.nodes
                .filter(checkTimelog)
                .map(({ timeSpent }) => timeSpent * 1000)
                .reduce((prev, current) => prev + current, 0),
            )
            .reduce((prev, current) => prev + current, 0),
        ] as [string, number],
    )
    .filter(([, totalTimeSpent]) => totalTimeSpent !== 0)
    .map(([name, totalTimeSpent], index) => ({
      title: name,
      value: totalTimeSpent,
      color: colors[index % colors.length],
    }));
};

export const getIssueTimelogs: DataTransformer = (data, checkTimelog) => {
  return data?.projects.nodes
    .filter(({ issues }) => issues.nodes.length > 0)
    .map(({ issues }) => issues.nodes)
    .flat()
    .map(
      ({ iid, title, timelogs, webUrl }) =>
        [
          formatTitle({ iid, title }),
          webUrl,
          timelogs.nodes
            .filter(checkTimelog)
            .map(({ timeSpent }) => timeSpent * 1000)
            .reduce((prev, current) => prev + current, 0),
        ] as [string, string, number],
    )
    .filter(([, , totalTimeSpent]) => totalTimeSpent !== 0)
    .map(([title, webUrl, totalTimeSpent], index) => ({
      title,
      url: webUrl,
      value: totalTimeSpent,
      color: colors[index % colors.length],
    }));
};

export const getDayTimelogs: DataTransformer = (data, checkTimelog) => {
  if (!data) {
    return undefined;
  }

  const dateTimelogMap: Record<string, number> = {};

  data?.projects.nodes
    .filter(({ issues }) => issues.nodes.length > 0)
    .map(({ issues }) => issues.nodes)
    .flat()
    .map(({ timelogs }) => timelogs.nodes)
    .flat()
    .filter(checkTimelog)
    .map(
      ({ timeSpent, spentAt }) => [new Date(spentAt), timeSpent * 1000] as [Date, number],
    )
    .filter(([, totalTimeSpent]) => totalTimeSpent !== 0)
    .sort(([prev], [next]) => prev.getTime() - next.getTime())
    .map(
      ([date, totalTimeSpent]) =>
        [formatDateLabel(date), totalTimeSpent] as [string, number],
    )
    .forEach(([spentAt, totalTimeSpent]) => {
      if (!dateTimelogMap[spentAt]) {
        dateTimelogMap[spentAt] = 0;
      }
      dateTimelogMap[spentAt] += totalTimeSpent;
    });

  return Object.entries(dateTimelogMap).map(([spentAt, totalTimeSpent]) => ({
    title: spentAt,
    value: totalTimeSpent,
    color: colors[0],
  }));
};

function formatDateLabel(date: Date): string {
  const now = new Date();
  if (
    date.getDay() === now.getDay() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return 'today';
  }

  return date.toLocaleDateString('en', {
    day: '2-digit',
    month: '2-digit',
  });
}
