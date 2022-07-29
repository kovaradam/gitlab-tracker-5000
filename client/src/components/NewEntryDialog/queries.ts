import { gql } from 'graphql-request';
import { gqlClient } from 'store/use-query';

export const GET_PROJECTS = gql`
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

export type GetProjectsQueryResponse = {
  projects: {
    nodes: {
      name: string;
      issues: {
        nodes: Issue[];
      };
    }[];
  };
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

export function submitIssue(
  variables: SubmitIssueQueryVariables,
): Promise<SubmitIssueQueryResponse> {
  return gqlClient.request<SubmitIssueQueryResponse>(SUBMIT_ISSUE, variables);
}
