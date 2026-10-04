import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { app } from './server.js';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'turtletrack-backend-api',
      configureServer(server) {
        server.middlewares.use(app);
      }
    }
  ]
});
