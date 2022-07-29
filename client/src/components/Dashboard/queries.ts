import { gql } from 'graphql-request';

export const GET_TIMELOGS = gql`
  query GetTimelogs($username: String, $startDate: Time, $endDate: Time) {
    timelogs(username: $username, startDate: $startDate, endDate: $endDate) {
      pageInfo {
        hasNextPage
      }
      nodes {
        spentAt
        timeSpent
        user {
          username
        }
        issue {
          iid
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
    };
    nodes: {
      spentAt: string;
      timeSpent: number;
      user: {
        username: string;
      };
      issue: {
        iid: string;
        webUrl: string;
        title: string;
        projectId: string;
      };
    }[];
  };
};

export type GetTimelogsVariables = {
  username: string;
  startDate: string;
  endDate: string;
};

export type Timelog = { spentAt: string; timeSpent: number; user: { username: string } };

export const GET_PROJECTS = gql`
  query GetProjects($ids: [ID!]) {
    projects(ids: $ids) {
      nodes {
        name
        id
      }
    }
  }
`;

export type GetProjectsResponse = {
  projects: {
    nodes: {
      id: string;
      name: string;
    }[];
  };
};

export type GitlabId = `gid://gitlab/Project/${string}`;

export type GetProjectsVariables = {
  ids: Array<GitlabId>;
};
