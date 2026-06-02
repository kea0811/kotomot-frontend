import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Listen on all interfaces (incl. Tailscale) so the dev server is
    // reachable from other devices on the tailnet, not just localhost.
    host: true,
    port: 5173,
    proxy: {
      // Proxy API calls to the remote backend server-side so the browser
      // only ever talks same-origin (no CORS). changeOrigin rewrites the
      // Host header so the upstream accepts the forwarded request.
      // To use the local Docker backend instead, set target to
      // 'http://localhost:4000'.
      '/api': {
        target: 'https://koto-api.zeusx.ai',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
