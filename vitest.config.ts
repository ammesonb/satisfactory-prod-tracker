import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { Vuetify3Resolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      dirs: ['src'],
      extensions: ['vue'],
      dts: true,
      resolvers: [Vuetify3Resolver()],
    }),
  ],
  define: {
    'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify('test-client-id'),
    'import.meta.env.VITE_GOOGLE_API_KEY': JSON.stringify('test-api-key'),
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: [
      './src/logistics/__tests__/test-setup.ts',
      './src/components/__tests__/component-setup.ts',
    ],
    server: {
      deps: {
        inline: ['vuetify'],
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
