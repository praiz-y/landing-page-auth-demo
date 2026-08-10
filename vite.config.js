import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        login: resolve(root, 'login.html'),
        signup: resolve(root, 'signup.html'),
        dashboard: resolve(root, 'dashboard.html'),
        notes: resolve(root, 'notes.html'),
        goals: resolve(root, 'goals.html')
      }
    }
  }
});
