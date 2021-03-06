import React from 'react';
import { createHeaders } from '../config/api';
import { serviceTokenStorage } from '../config/storage';
import { useFetch } from '../utils/use-fetch';

const url = `${process.env.REACT_APP_SERVER_URL}/api/timestamp`;
const headers = createHeaders(serviceTokenStorage.get() ?? '');

export function useTimestamp(): {
  timestamp: number | null;
  isLoading: boolean;
  startTimer: () => void;
  stopTimer: () => void;
} {
  const [fetchTimestamp, { data: timestamp, isLoading }] = useFetch<number>(url, headers);

  React.useEffect(fetchTimestamp, [fetchTimestamp]);

  const startTimer = React.useCallback((): void => {
    fetchTimestamp({ method: 'POST' });
  }, [fetchTimestamp]);

  const stopTimer = React.useCallback((): void => {
    fetchTimestamp({ method: 'DELETE' });
  }, [fetchTimestamp]);

  return React.useMemo(
    () => ({
      timestamp,
      isLoading,
      stopTimer,
      startTimer,
    }),
    [timestamp, stopTimer, startTimer, isLoading],
  );
}
