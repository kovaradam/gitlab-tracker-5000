import { gql } from 'graphql-request';

export const GET_TIMELOGS = gql`
  query getTimelogs {
    projects(membership: true, searchNamespaces: true) {
      nodes {
        name
        issues {
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
        name: string;
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
