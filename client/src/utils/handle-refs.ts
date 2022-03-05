export function handleRefs(...refs: React.ForwardedRef<HTMLInputElement>[]) {
  return (element: HTMLInputElement | null): void => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(element);
      } else {
        (ref as React.MutableRefObject<typeof element>).current = element;
      }
    });
  };
}
