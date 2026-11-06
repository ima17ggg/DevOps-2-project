import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [plugin()],
    server: {
        port: 64190,
        host: true, // 👈 escucha en todas las interfaces (0.0.0.0) para Docker
        watch: {
            usePolling: true, // 👈 necesario en Windows + Docker para detectar cambios
        },
        proxy: {
            '/api/rtls': {
                target: process.env.VITE_RTLS_HTTP_URL || 'http://127.0.0.1:4000',
                changeOrigin: true,
                secure: false,
            },
            '/socket': {
                target: process.env.VITE_RTLS_WS_URL || 'ws://127.0.0.1:4000',
                ws: true,
                changeOrigin: true,
            },
            '/api': {
                target: process.env.VITE_API_URL || 'http://127.0.0.1:3000',
                changeOrigin: true,
                secure: false,
            },
        },
    }
})
