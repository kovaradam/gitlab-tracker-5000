import { createStorage } from '../utils/storage';

export const [gitlabUrlStorage, tokenStorage] = ['gitlab-url', 'gitlab-token'].map(
  createStorage,
);
