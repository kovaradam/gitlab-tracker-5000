import { gql } from 'graphql-request';

export const GET_TIMELOGS = gql`
  query getTimelogs($username: String!) {
    projects(membership: true, searchNamespaces: true) {
      nodes {
        issues(authorUsername: $username) {
          nodes {
            iid
            timelogs {
              nodes {
                spentAt
                user {
                  username
                }
                timeSpent
              }
            }
          }
        }
      }
    }
  }
`;

export type GetTimelogsResponse = {
  projects: {
    nodes: [
      {
        issues: {
          nodes: [
            {
              iid: string;
              timelogs: {
                nodes: [
                  { spentAt: string; timeSpent: number; user: { username: string } },
                ];
              };
            },
          ];
        };
      },
    ];
  };
};
