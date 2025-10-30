import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    base: process.env.VITE_BASE_URL || '/', // use env var or fallback
    plugins: [react()],
    server: {
        fs: {

            allow: ['.', 'C:\\Users\\propo\\node_modules']
        }
    }
})
