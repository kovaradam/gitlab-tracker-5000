import { gql } from 'graphql-request';

export const GET_PROJECTS = gql`
  query getIssues($username: String!, $search: String) {
    projects(membership: true, searchNamespaces: true) {
      nodes {
        name
        issues(authorUsername: $username, search: $search) {
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