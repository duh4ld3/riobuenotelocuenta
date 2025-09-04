import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables prefaced with VITE_ so they are available in import.meta.env
  loadEnv(mode, process.cwd());
  return {
    plugins: [react()],
    // Define any global constants here if needed
    define: {
      __APP_VERSION__: JSON.stringify('1.0.0'),
    },
    server: {
      port: 5173,
    },
  };
});