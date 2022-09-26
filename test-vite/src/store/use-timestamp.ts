import React from 'react';
import { createStorage } from 'utils/storage';
import { createHeaders, SERVER_URL } from '../config/api';
import { serviceTokenStorage } from '../config/storage';
import { useFetch } from '../utils/use-fetch';

const url = `${SERVER_URL}/api/timestamp`;
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

export const trackedTimeStorage = createStorage('tracked-time');
