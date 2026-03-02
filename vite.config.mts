import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async ({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: null,
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'Sabores Ruiz Recetario',
          short_name: 'Sabor Ruiz',
          description: 'Tu recetario personal con sabor global.',
          theme_color: '#10b981',
          icons: [
            {
              src: 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=192&h=192',
              sizes: '192x192',
              type: 'image/jpeg'
            },
            {
              src: 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=512&h=512',
              sizes: '512x512',
              type: 'image/jpeg'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
