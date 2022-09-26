import { SERVER_URL } from 'config/api';
import React from 'react';
import { gitlabTokenStorage } from '../config/storage';

export function useLogin(): { isLoggedIn: boolean; isLoading: boolean } {
  const [isLoggedIn, setIsLoggedIn] = React.useState(gitlabTokenStorage.get() !== null);
  const [isLoading, setIsLoading] = React.useState(!isLoggedIn);

  React.useEffect(() => {
    if (isLoggedIn) {
      return;
    }
    const url = `${SERVER_URL ?? ''}/api/timestamp`;

    fetch(url)
      .then(({ status }) => {
        setIsLoggedIn([200, 204].includes(status));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setIsLoading, setIsLoggedIn, isLoggedIn]);

  return { isLoading, isLoggedIn };
}
