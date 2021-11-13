import { createStorage } from '../utils/storage';

export const [gitlabUrlStorage, gitlabTokenStorage, serviceTokenStorage] = [
  'gitlab-url',
  'gitlab-token',
  'service-token',
].map(createStorage);
