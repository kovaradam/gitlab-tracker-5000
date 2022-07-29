import { RequestDocument, Variables } from 'graphql-request/dist/types';
import React from 'react';
import { createGraphQLClient } from '../config/api';
import { gitlabUrlStorage, gitlabTokenStorage } from '../config/storage';
import {
  QueryKey,
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const [endpoint, token] = [gitlabUrlStorage.get(), gitlabTokenStorage.get()];
if (!endpoint || !token) {
  throw new Error('Url or token has not been set!');
}

export const gqlClient = createGraphQLClient(endpoint, token);

export const QueryProvider: React.FC<React.PropsWithChildren<unknown>> = (props) => {
  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
};

export function useGqlQuery<DataType, VariablesType extends Variables = Variables>(
  query: RequestDocument,
  options: { queryKey: QueryKey; variables?: VariablesType },
): UseQueryResult<DataType> {
  return useQuery(
    options.queryKey,
    async () => await gqlClient.request<DataType>(query, options?.variables),
  );
}

export function useGqlMutation<DataType, VariablesType extends Variables>(
  query: RequestDocument,
): UseMutationResult<DataType, unknown, VariablesType> {
  return useMutation<DataType, unknown, VariablesType>((variables) =>
    gqlClient.request<DataType>(query, variables),
  );
}

type Pagination = { pageInfo: { hasNextPage: boolean; endCursor: string } };
type PageVariables = { after: string };

export function useQueryWithCursor<DataType>(
  query: RequestDocument,
  mergeData: (prevData: DataType | null, newData: DataType | null) => DataType | null,
): [
  (variables?: Variables) => Promise<DataType | null>,
  { data: DataType | null; isLoading: boolean; error: Error | null },
] {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [data, setData] = React.useState<DataType | null>(null);

  const fetch = React.useCallback(
    async (variables?: Variables) => {
      if (!gqlClient) {
        throw new Error(`GraphQL client has not been initialized or isn't provided`);
      }
      setData(null);
      try {
        // ew
        let hasNextPage = true;
        let returnData: DataType | null = null;
        variables = variables ?? {};

        while (hasNextPage) {
          setIsLoading(true);
          setError(null);
          const data = await gqlClient.request<DataType>(query, variables);
          returnData = mergeData(returnData, data);
          setData(returnData);
          const { pageInfo } = asPagination(data);
          hasNextPage = pageInfo.hasNextPage;
          (variables as PageVariables).after = pageInfo.endCursor;
        }

        setIsLoading(false);
        return returnData;
      } catch (error) {
        setIsLoading(false);
        setError(error as Error);
        return null;
      }
    },
    [setIsLoading, setData, setError, query, mergeData],
  );

  return [fetch, { data, isLoading, error }];
}

// create return data as paginated object
function asPagination(data: unknown): Pagination {
  const dataRecord = data as Record<string, unknown>;
  return dataRecord[Object.keys(dataRecord)[0] as keyof typeof data] as Pagination;
}
