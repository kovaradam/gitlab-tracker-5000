import { GraphQLClient } from 'graphql-request';
import { RequestDocument, Variables } from 'graphql-request/dist/types';
import React from 'react';
import { createGraphQLClient } from '../config/api';
import { gitlabUrlStorage, gitlabTokenStorage } from '../config/storage';

const QueryContext = React.createContext<GraphQLClient | null>(null);

export const QueryProvider: React.FC<React.PropsWithChildren<unknown>> = (props) => {
  const client = React.useMemo(() => {
    const [endpoint, token] = [gitlabUrlStorage.get(), gitlabTokenStorage.get()];
    if (!endpoint || !token) {
      throw new Error('Url or token has not been set!');
    }
    return createGraphQLClient(endpoint, token);
  }, []);

  return <QueryContext.Provider value={client}>{props.children}</QueryContext.Provider>;
};

export function useQuery<DataType>(
  query: RequestDocument,
): [
  (variables?: Variables) => Promise<DataType | null>,
  { data: DataType | null; isLoading: boolean; error: Error | null },
] {
  const client = React.useContext(QueryContext);
  const [error, setError] = React.useState<Error | null>(null);
  const [data, setData] = React.useState<DataType | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetch = React.useCallback(
    async (variables?: Variables) => {
      if (!client) {
        throw new Error(`GraphQL client has not been initialized or isn't provided`);
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await client.request<DataType>(query, variables);
        setData(data);
        return data;
      } catch (error) {
        setError(error as Error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [setData, setError, client, query],
  );

  return [fetch, { data, isLoading, error }];
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
  const client = React.useContext(QueryContext);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [data, setData] = React.useState<DataType | null>(null);

  const fetch = React.useCallback(
    async (variables?: Variables) => {
      if (!client) {
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
          const data = await client.request<DataType>(query, variables);
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
    [setIsLoading, setData, setError, client, query, mergeData],
  );

  return [fetch, { data, isLoading, error }];
}

// create return data as paginated object
function asPagination(data: unknown): Pagination {
  const dataRecord = data as Record<string, unknown>;
  return dataRecord[Object.keys(dataRecord)[0] as keyof typeof data] as Pagination;
}
