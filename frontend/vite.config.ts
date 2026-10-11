import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { rootyChatPlugin } from './vite-chat-plugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), rootyChatPlugin()],
})

