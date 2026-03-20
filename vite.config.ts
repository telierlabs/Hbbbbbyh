import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  define: {
    'import.meta.env.GEM_KEY': JSON.stringify(process.env.GEM_KEY),
    'import.meta.env.GEM_KEY2': JSON.stringify(process.env.GEM_KEY2),
    'import.meta.env.GEM_KEY3': JSON.stringify(process.env.GEM_KEY3),
    'import.meta.env.IMG_KEY': JSON.stringify(process.env.IMG_KEY),
    'import.meta.env.SA_KEY': JSON.stringify(process.env.SA_KEY),
    'import.meta.env.FB_API': JSON.stringify(process.env.FB_API),
    'import.meta.env.FB_AUTH': JSON.stringify(process.env.FB_AUTH),
    'import.meta.env.FB_PID': JSON.stringify(process.env.FB_PID),
    'import.meta.env.FB_STOR': JSON.stringify(process.env.FB_STOR),
    'import.meta.env.FB_SID': JSON.stringify(process.env.FB_SID),
    'import.meta.env.FB_AID': JSON.stringify(process.env.FB_AID),
    'import.meta.env.FB_MID': JSON.stringify(process.env.FB_MID),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
