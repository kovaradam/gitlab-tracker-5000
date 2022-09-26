import { gql } from 'graphql-request';
import { useGraphqlClient } from 'store/use-graphql-query';

export const GET_SEARCH_ISSUES = gql`
  query getIssues($search: String) {
    projects(membership: true, sort: "updated_desc") {
      nodes {
        name
        issues(search: $search) {
          nodes {
            title
            iid
            id
            webUrl
          }
        }
      }
    }
  }
`;

export type GetSearchQueryResponse = {
  projects: {
    nodes: {
      name: string;
      issues: {
        nodes: Issue[];
      };
    }[];
  };
};

export type GetSearchVariables = {
  search: string;
};

export type Issue = {
  title: string;
  iid: string;
  id: string;
  webUrl: string;
  projectName: string;
};

export const SUBMIT_ISSUE = gql`
  mutation addTime($id: NoteableID!, $body: String!) {
    createNote(input: { noteableId: $id, body: $body }) {
      errors
    }
  }
`;

export type SubmitIssueQueryResponse = {
  createNote: {
    errors: string[];
  };
};

export type SubmitIssueQueryVariables = {
  id: string;
  body: string;
};

export function useSubmitIssue(): (
  variables: SubmitIssueQueryVariables,
) => Promise<SubmitIssueQueryResponse> {
  const graphqlClient = useGraphqlClient();
  return (variables) => {
    if (!graphqlClient) {
      throw Error('graphql client not provided');
    }
    return graphqlClient?.request<SubmitIssueQueryResponse>(SUBMIT_ISSUE, variables);
  };
}
