import { RequestDocument, Variables } from 'graphql-request/dist/types';
import React from 'react';
import { createGraphQLClient } from '../config/api';
import { gitlabUrlStorage, gitlabTokenStorage } from '../config/storage';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { GraphQLClient } from 'graphql-request';
import invariant from 'tiny-invariant';

const GraphqlClientContext = React.createContext<GraphQLClient | null>(null);

export function GraphQlQueryProvider(props: { children: React.ReactNode }): JSX.Element {
  const graphqlClient = React.useMemo(() => {
    const [endpoint, token] = [gitlabUrlStorage.get(), gitlabTokenStorage.get()];

    if (!endpoint || !token) {
      throw new Error('Url or token has not been set!');
    }

    return createGraphQLClient(endpoint, token);
  }, []);

  return (
    <GraphqlClientContext.Provider value={graphqlClient}>
      {props.children}
    </GraphqlClientContext.Provider>
  );
}

export const useGraphqlClient = (): GraphQLClient | null =>
  React.useContext(GraphqlClientContext);

export function useGqlQuery<DataType, VariablesType extends Variables = Variables>(
  query: RequestDocument,
  options: { queryKey: QueryKey; variables?: VariablesType },
): UseQueryResult<DataType> {
  const graphqlClient = useGraphqlClient();
  return useQuery(options.queryKey, async () => {
    invariant(graphqlClient, 'graphQl client has not been initialized');

    return graphqlClient.request<DataType>(query, options?.variables);
  });
}

export function useGqlMutation<DataType, VariablesType extends Variables>(
  query: RequestDocument,
): UseMutationResult<DataType, unknown, VariablesType> {
  const graphqlClient = useGraphqlClient();
  return useMutation<DataType, unknown, VariablesType>((variables) => {
    invariant(graphqlClient, 'graphQl client has not been initialized');

    return graphqlClient.request<DataType>(query, variables);
  });
}

type PageInfo = { hasNextPage: boolean; endCursor: string };
type PageVariables = { after?: string };

export function useQueryWithCursor<Response, Variables extends PageVariables>(
  query: RequestDocument,
  options: {
    variables: Variables;
    merge: (prev: Response, next: Response) => Response;
    getPageInfo: (response: Response) => PageInfo;
    queryKey: QueryKey;
    refetchOnWindowFocus?: boolean;
  },
): UseQueryResult<Response> {
  const graphqlClient = useGraphqlClient();

  const fetchQuery = (variables: Variables): Promise<Response> => {
    invariant(graphqlClient, 'graphQl client has not been initialized');
    return graphqlClient.request<Response>(query, variables);
  };

  return useQuery(
    [options.queryKey, options.variables],
    async () =>
      fetchQuery(options.variables).then(async (response) => {
        let pageInfo = options.getPageInfo(response);
        while (pageInfo.hasNextPage) {
          const { endCursor } = pageInfo;
          const nextResponse = await fetchQuery({
            ...options.variables,
            after: endCursor,
          });

          response = options.merge(response, nextResponse);
          pageInfo = options.getPageInfo(nextResponse);
        }
        return response;
      }),
    { refetchOnWindowFocus: options.refetchOnWindowFocus },
  );
}
