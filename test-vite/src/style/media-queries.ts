export const mediaQueries = {
  desktop: createQuery(750),
  create: createQuery,
};

function createQuery(width: number, axis = 'width'): string {
  return `only screen and (min-${axis}: ${width}px)`;
}
