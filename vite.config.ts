import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  base: '/cartelera-de-peliculas/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
