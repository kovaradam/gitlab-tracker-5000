import { getTimeValuesFromMillis } from '../../utils/time';
import { IssueCard } from './use-issue-cards';

export function createIssueNote({ time, description, id }: IssueCard): {
  id: string;
  body: string;
} {
  const isSubtraction = time < 0;
  const { hours, minutes, seconds } = getTimeValuesFromMillis(Math.abs(time));
  const timeNote = `/spend ${isSubtraction ? '-' : ''}${hours}h${minutes}m${seconds}s`;
  const body = `${timeNote}\n${description ?? ''}`;

  return { id, body };
}
