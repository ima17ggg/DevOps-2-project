import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    server: {
        port: 64190,
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL || 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    }
})