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

export function areValidErrors(errors: string[]): boolean {
  const ignoredMessages = ['Commands only Added', 'Commands only Subtracted'];
  if (!errors.length) {
    return false;
  }
  if (
    errors.some((error) =>
      ignoredMessages.some((ignoredMessage) => error.includes(ignoredMessage)),
    )
  ) {
    return false;
  }

  return true;
}
