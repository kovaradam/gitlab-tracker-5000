import React, { useCallback } from 'react';
import { useToggle } from './use-toggle';

export function useFetch<T>(
  url: string,
  headers?: Headers,
): [
  fetchData: (init?: RequestInit) => void,
  state: { data: T | null; isLoading: boolean; error: Error | null },
] {
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, loadingToggle] = useToggle(false);
  const [error, setError] = React.useState<Error | null>(null);
  const fetchData = useCallback(
    (init?: RequestInit) => {
      loadingToggle.on();
      fetch(url, { ...init, headers })
        .then((response) => response.json())
        .then(setData)
        .catch((error) => {
          setError(error);
          setData(null);
        })
        .finally(loadingToggle.off);
    },
    [url, headers, setData, setError, loadingToggle],
  );

  return [fetchData, { data, isLoading, error }];
}
