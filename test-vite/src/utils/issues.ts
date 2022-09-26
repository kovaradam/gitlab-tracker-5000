export function formatTitle(issue: { title: string; iid: string }): string {
  return `#${issue.iid}: ${issue.title}`;
}
