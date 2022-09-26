import { GraphQLClient } from 'graphql-request';

export const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export function createHeaders(token: string): Headers {
  return new Headers({ authorization: `Bearer ${token}` });
}

export function createGraphQLClient(endpointUrl: string, token: string): GraphQLClient {
  const graphQlEndpointUrl = endpointUrl.concat('/api/graphql');
  return new GraphQLClient(graphQlEndpointUrl, { headers: createHeaders(token) });
}
