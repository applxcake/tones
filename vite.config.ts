import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Tones',
        short_name: 'Tones',
        description: 'Your Music Experience',
        theme_color: '#2d0b4e',
        background_color: '#18122b',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '48x48',
            type: 'image/x-icon'
          },
          {
            src: '/music-note.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/music-note.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Handle Node.js built-in module polyfills
  optimizeDeps: {
    exclude: ['pg', 'pg-pool', 'pg-connection-string', 'mysql2', 'mysql2/promise']
  },
  build: {
    commonjsOptions: {
      // Prevent resolving Node.js built-in modules
      transformMixedEsModules: true
    },
    rollupOptions: {
      // Explicitly mark problematic modules as external
      external: [
        'fs', 
        'path', 
        'crypto', 
        'util', 
        'events', 
        'stream', 
        'net', 
        'tls', 
        'dns',
        'cloudflare:sockets',
        'mysql2',
        'mysql2/promise',
        'require'
      ]
    }
  }
}));
