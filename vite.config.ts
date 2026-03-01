import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './public/manifest.json'

export default defineConfig(({ mode }) => {
  const isTest = mode === 'test'

  return {
    plugins: isTest ? [react()] : [react(), crx({ manifest })],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html']
      }
    }
  }
})
