import { getTimeValuesFromMillis } from '../../utils/time';
import { GitlabId } from './queries';

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

export function formatTime(time: number): string {
  const { hours, minutes } = getTimeValuesFromMillis(time);
  return `${hours}h ${minutes}m`;
}

export function createGitlabProjectId(id: string): GitlabId {
  return `gid://gitlab/Project/${id}`;
}
