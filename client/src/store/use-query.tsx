import { GraphQLClient } from 'graphql-request';
import { RequestDocument, Variables } from 'graphql-request/dist/types';
import React from 'react';
import { createGraphQLClient } from '../config/api';
import { gitlabUrlStorage, tokenStorage } from '../config/storage';

const QueryContext = React.createContext<GraphQLClient | null>(null);

export const QueryProvider: React.FC = (props) => {
  const client = React.useMemo(() => {
    const [endpoint, token] = [gitlabUrlStorage.get(), tokenStorage.get()];
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
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [data, setData] = React.useState<DataType | null>(null);

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
        setIsLoading(false);
        return data;
      } catch (error) {
        setError(error as Error);
        return null;
      }
    },
    [setIsLoading, setData, setError, client, query],
  );

  return [fetch, { data, isLoading, error }];
}
