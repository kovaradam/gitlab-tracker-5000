const data: Record<string, string> = {};

type Storage = {
  get: (key: string) => string | null;
  delete: (key: string) => void;
  set: (key: string, value: string) => void;
};

export function createInMemoryStorage(): Storage {
  return {
    get: (key: string) => data[key] ?? null,
    delete: (key: string) => delete data[key],
    set: (key: string, value: string) => {
      data[key] = value;
    },
  };
}

export function createLocalStorage(): Storage {
  return {
    get: localStorage.getItem.bind(localStorage),
    delete: localStorage.removeItem.bind(localStorage),
    set: localStorage.setItem.bind(localStorage),
  };
}
