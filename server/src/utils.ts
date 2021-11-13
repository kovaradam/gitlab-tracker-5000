export function createTimestamp(): string {
  const now = new Date();
  return String(now.getTime());
}
