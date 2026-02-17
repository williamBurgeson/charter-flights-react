import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// not sure how to make this dynamic based on environment as it is a build time setting
// maybe based on env variable? - but not important enough to tackle at the moment

//const base = '/'
const base = process.env.VITE_BASE_URL || '/'

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
