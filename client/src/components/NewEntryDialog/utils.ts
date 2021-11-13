import { getTimeValuesFromMillis } from '../../utils/time';
import { IssueCard } from './use-issue-cards';

export function createIssueNote({ time, description, id }: IssueCard): {
  id: string;
  body: string;
} {
  const { hours, minutes, seconds } = getTimeValuesFromMillis(time);
  const timeNote = `/spend ${hours}h${minutes}m${seconds}s`;
  const body = `${timeNote}\n${description ?? ''}`;

  return { id, body };
}
