import { DataEntry } from 'react-minimal-pie-chart/types/commonTypes';
import { formatTitle } from '../../utils/issues';
import { GetTimelogsResponse, Timelog } from './queries';

export function dateToHtmlProp(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function mergeProjectData(
  prevData: GetTimelogsResponse | null,
  newData: GetTimelogsResponse | null,
): GetTimelogsResponse | null {
  if (prevData === null) {
    return newData;
  }
  if (newData === null) {
    return prevData;
  }
  const projectNodes = [...prevData.projects.nodes, ...newData.projects.nodes];
  return { ...newData, projects: { nodes: projectNodes } };
}

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
      ({ iid, title, timelogs }) =>
        [
          formatTitle({ iid, title }),
          timelogs.nodes
            .filter(checkTimelog)
            .map(({ timeSpent }) => timeSpent * 1000)
            .reduce((prev, current) => prev + current, 0),
        ] as [string, number],
    )
    .filter(([, totalTimeSpent]) => totalTimeSpent !== 0)
    .map(([title, totalTimeSpent], index) => ({
      title,
      value: totalTimeSpent,
      color: colors[index % colors.length],
    }));
};
