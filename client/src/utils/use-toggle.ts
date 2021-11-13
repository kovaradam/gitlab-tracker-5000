import React from 'react';

export function useToggle(
  initValue = false,
): [
  boolean,
  { on: () => void; off: () => void; toggle: () => void; set: (state: boolean) => void },
] {
  const [state, setState] = React.useState(initValue);

  const on = React.useCallback(() => setState(true), [setState]);
  const off = React.useCallback(() => setState(false), [setState]);
  const toggle = React.useCallback(() => setState((p) => !p), [setState]);

  const updaters = React.useMemo(
    () => ({ on, off, toggle, set: setState }),
    [on, off, toggle, setState],
  );

  return [state, updaters];
}
