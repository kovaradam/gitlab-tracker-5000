import { UseQueryResult } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useQueryWithCursor } from 'store/use-graphql-query';

export const GET_TIMELOGS = gql`
  query GetTimelogs($username: String, $startDate: Time, $endDate: Time, $after: String) {
    timelogs(
      username: $username
      startDate: $startDate
      endDate: $endDate
      after: $after
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        spentAt
        timeSpent
        user {
          username
        }
        issue {
          iid
          id
          webUrl
          title
          projectId
        }
      }
    }
  }
`;

export type GetTimelogsResponse = {
  timelogs: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
    nodes: {
      spentAt: string;
      timeSpent: number;
      user: {
        username: string;
      };
      issue: {
        iid: string;
        id: string;
        webUrl: string;
        title: string;
        projectId: string;
      } | null;
    }[];
  };
};

export type GetTimelogsVariables = {
  username: string;
  startDate: string;
  endDate: string;
  after?: string;
};

export type Timelog = { spentAt: string; timeSpent: number; user: { username: string } };

export const GET_PROJECTS = gql`
  query GetProjects($ids: [ID!], $after: String) {
    projects(ids: $ids, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        name
        id
      }
    }
  }
`;

export type GetProjectsResponse = {
  projects: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
    nodes: {
      id: string;
      name: string;
    }[];
  };
};

export type GitlabId = `gid://gitlab/Project/${string}`;

export type GetProjectsVariables = {
  ids: GitlabId[];
  after?: string;
};

export function useTimelogsQuery(
  variables: GetTimelogsVariables,
): UseQueryResult<GetTimelogsResponse> {
  return useQueryWithCursor<GetTimelogsResponse, typeof variables>(GET_TIMELOGS, {
    variables,
    getPageInfo(response) {
      return response.timelogs.pageInfo;
    },
    merge(prev, next) {
      const merged = prev;
      merged.timelogs.nodes = merged.timelogs.nodes.concat(next.timelogs.nodes);
      return merged;
    },
    queryKey: ['dashboard'],
    refetchOnWindowFocus: false,
  });
}

export function useProjectsQuery(
  variables: GetProjectsVariables,
): UseQueryResult<GetProjectsResponse> {
  return useQueryWithCursor<GetProjectsResponse, typeof variables>(GET_PROJECTS, {
    variables,
    getPageInfo(response) {
      return response.projects.pageInfo;
    },
    merge(prev, next) {
      const merged = prev;
      merged.projects.nodes = merged.projects.nodes.concat(next.projects.nodes);
      return merged;
    },
    queryKey: ['dashboard'],
  });
}
