import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://smart-expense-tracker-2328.onrender.com',
        changeOrigin: true,
      },
    },
  },
});
