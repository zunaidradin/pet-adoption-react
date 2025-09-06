import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Add proxy for both /api and /uploads so image paths like /uploads/xyz.jpg resolve in dev
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
  port: 5173,
  strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
});
