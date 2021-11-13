/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createStorage(key: string) {
  return {
    get(): string | null {
      return localStorage.getItem(key);
    },
    set(token: string): void {
      localStorage.setItem(key, token);
    },
    delete(): void {
      localStorage.removeItem(key);
    },
  };
}
