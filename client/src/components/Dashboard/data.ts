import { DataEntry } from 'react-minimal-pie-chart/types/commonTypes';
import { formatTitle } from '../../utils/issues';
import { GetProjectsResponse, GetTimelogsResponse } from './queries';
import { createGitlabProjectId } from './utils';

const colors = ['var(--main-color)', '#ff9a9a'];

type DateRange = { from: Date; to: Date };

export function getProjectTimelogs(
  { projects }: GetProjectsResponse,
  { timelogs }: GetTimelogsResponse,
): DataEntry[] {
  return (
    projects.nodes
      .map((project) => ({
        ...project,
        timelogs: timelogs.nodes.filter((timelog) => {
          return project.id === createGitlabProjectId(timelog.issue?.projectId ?? '');
        }),
      }))

      .map((project, index) => ({
        title: project.name,
        color: colors[index % colors.length],
        value: getTotalTimeSpent(project.timelogs),
      })) ?? []
  );
}

export function getIssueTimelogs(data: GetTimelogsResponse): Array<DataEntry> {
  const issueMap = new Map<string, GetTimelogsResponse['timelogs']['nodes']>();

  data?.timelogs.nodes.forEach((timelog) => {
    const issueId = timelog.issue?.id;
    if (!issueId) {
      return;
    }
    const issueTimelogs = issueMap.get(issueId);
    issueMap.set(issueId, issueTimelogs?.concat(timelog) ?? [timelog]);
  });

  const entries: Array<DataEntry> = [];
  let index = 0;
  issueMap.forEach((timelogs) => {
    const issue = timelogs?.[0]?.issue;
    if (!issue) {
      return;
    }

    entries.push({
      title: formatTitle(issue),
      url: issue.webUrl,
      value: getTotalTimeSpent(timelogs),
      color: colors[index++ % colors.length],
    });
  });

  return entries;
}

function getDaysInRange({ from, to }: DateRange): Date[] {
  const dayInMs = 24 * 60 * 60 * 1000;
  const datesInRange: Date[] = [];
  const [fromDayInMs, toDayInMs] = [from.getTime(), to.getTime()];

  for (let i = fromDayInMs; i < toDayInMs; i += dayInMs) {
    const newDate = new Date(i);

    datesInRange.push(newDate);
  }

  return datesInRange;
}

export function getDayTimelogs(
  data: GetTimelogsResponse,
  range: DateRange,
): Array<DataEntry> {
  if (!data) {
    return [];
  }
  const dateFormatter = formatDateLabel;

  const dateTimelogMap: Record<string, number> = {};

  getDaysInRange(range).forEach((dateInRange) => {
    const dateLabel = dateFormatter(dateInRange);
    dateTimelogMap[dateLabel] = 0;
  });

  data?.timelogs.nodes
    .map(
      ({ spentAt, timeSpent }) => [new Date(spentAt), timeSpent * 1000] as [Date, number],
    )
    .filter(([, totalTimeSpent]) => totalTimeSpent !== 0)
    .sort(([prev], [next]) => prev.getTime() - next.getTime())
    .map(
      ([date, totalTimeSpent]) =>
        [dateFormatter(date), totalTimeSpent] as [string, number],
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
}

function formatDateLabel(date: Date): string {
  const now = new Date();
  if (
    date.getDate() === now.getDate() &&
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

function getTotalTimeSpent(timelogs: GetTimelogsResponse['timelogs']['nodes']): number {
  return timelogs
    .map((timelog) => timelog.timeSpent * 1000)
    .reduce((prev, current) => prev + current, 0);
}
