import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  base: process.env.NODE_ENV === 'production' ? '/sbti-test-app-h5-wx/' : '/'
})
