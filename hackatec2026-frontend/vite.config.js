import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [plugin()],
    server: {
        port: 64190,
        host: true, // 👈 escucha en todas las interfaces, no solo localhost
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL || 'http://127.0.0.1:3000',
                changeOrigin: true,
                secure: false,
            },
        },
    }
})