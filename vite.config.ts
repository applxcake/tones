
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Handle Node.js built-in module polyfills
  optimizeDeps: {
    exclude: ['pg', 'pg-pool', 'pg-connection-string']
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
        'cloudflare:sockets'
      ]
    }
  }
}));
