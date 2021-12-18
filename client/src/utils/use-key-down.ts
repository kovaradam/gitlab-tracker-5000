import React from 'react';

type Listener = (event: Event) => void;

function createListener(key: string, callback: (event: Event) => void): Listener {
  return (event): void => {
    if ((event as KeyboardEvent).key !== key) {
      return;
    }
    callback(event);
  };
}

export function useKeyDown(key: string, callback: (event: Event) => void): void {
  React.useEffect(() => {
    const listener = createListener(key, callback);
    window.addEventListener('keydown', listener);
    return (): void => {
      window.removeEventListener('keydown', listener);
    };
  }, [key, callback]);
}
