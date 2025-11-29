import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { env } from 'process'

const base = env.BASE_URL?.includes('github.io') ?  '/charter-flights-react/' : '/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  base: base,
})
