import { GetTimelogsResponse } from './queries';

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
