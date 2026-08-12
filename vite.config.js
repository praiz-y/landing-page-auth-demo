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
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.js'],
    setupFiles: ['./vitest.setup.js'],
    // The default 'forks' pool times out spawning worker processes in this
    // sandboxed environment (child_process fork is restricted) — 'threads'
    // uses worker_threads instead, which isn't. maxWorkers: 1 avoids
    // spinning up multiple jsdom environments in parallel, which was
    // exhausting available memory here.
    pool: 'threads',
    maxWorkers: 1
  }
});
