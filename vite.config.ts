import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'import.meta.env.GEM_KEY': JSON.stringify(env.GEM_KEY),
        'import.meta.env.GEM_KEY2': JSON.stringify(env.GEM_KEY2),
        'import.meta.env.GEM_KEY3': JSON.stringify(env.GEM_KEY3),
        'import.meta.env.IMG_KEY': JSON.stringify(env.IMG_KEY),
        'import.meta.env.FB_API': JSON.stringify(env.FB_API),
        'import.meta.env.FB_AUTH': JSON.stringify(env.FB_AUTH),
        'import.meta.env.FB_PID': JSON.stringify(env.FB_PID),
        'import.meta.env.FB_STOR': JSON.stringify(env.FB_STOR),
        'import.meta.env.FB_SID': JSON.stringify(env.FB_SID),
        'import.meta.env.FB_AID': JSON.stringify(env.FB_AID),
        'import.meta.env.FB_MID': JSON.stringify(env.FB_MID),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
