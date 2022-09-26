import React from 'react';

function useClickOutside(
  ref: React.MutableRefObject<HTMLElement | null>,
  callback: () => void,
): void {
  React.useEffect(() => {
    const listener = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (!ref.current || !target?.isConnected) {
        return;
      }
      const isTargetChild = ref.current.contains(target);
      if (!isTargetChild) {
        callback();
      }
    };
    document.addEventListener('click', listener);
    return (): void => {
      document.removeEventListener('click', listener);
    };
  }, [callback, ref]);
}

export default useClickOutside;

export function useClickOutsideRef<T extends HTMLElement>(
  callback: () => void,
): React.MutableRefObject<T | null> {
  const ref = React.useRef<T | null>(null);
  useClickOutside(ref, callback);
  return ref;
}
