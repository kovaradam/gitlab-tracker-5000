export function getTimeValuesFromMillis(
  milliseconds: number,
): Record<'hours' | 'minutes' | 'seconds', number> {
  const seconds = Math.floor(milliseconds / 1000) % 60;
  const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  return { hours, minutes, seconds };
}
