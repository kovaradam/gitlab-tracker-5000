import { getTimeValuesFromMillis } from '../../utils/time';
import { GetTimelogsResponse } from './queries';

export function max(a: number, b: number): number {
  return a > b ? a : b;
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date as unknown as number);
}

export function dateToHtmlProp(date: Date): string {
  // if "Invalid value" is passed by clear input browser action
  if (!isValidDate(date)) {
    date = new Date();
  }
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

export function formatTime(time: number): string {
  const { hours, minutes } = getTimeValuesFromMillis(time);
  return `${hours}h ${minutes}m`;
}
