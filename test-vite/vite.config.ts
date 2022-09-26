import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import eslint from 'vite-plugin-eslint';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteTsconfigPaths(), eslint(), VitePWA({ manifest: false })],
  build: {
    outDir: 'build',
  },
  server: {
    open: true,
    port: 3000,
  },
});
