import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Lädt auch Variablen ohne VITE_-Prefix – die landen NICHT im Browser-Bundle,
  // sondern werden nur hier im Dev-Proxy verwendet.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), tailwindcss()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: {
      port: 5173,
      proxy: env.DIRECTUS_URL
        ? {
            '/api': {
              target: env.DIRECTUS_URL,
              changeOrigin: true,
              secure: env.DIRECTUS_VERIFY_SSL !== 'false',
              rewrite: (path) => path.replace(/^\/api/, ''),
              headers: env.DIRECTUS_TOKEN ? { Authorization: `Bearer ${env.DIRECTUS_TOKEN}` } : {},
            },
          }
        : undefined,
    },
  }
})
