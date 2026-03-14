import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 5173,
        watch: {
            usePolling: true, // <-- add this
            interval: 100, // optional: faster polling interval
        },
        proxy: {
            '/api': {
                target: 'http://backend:8080',
                changeOrigin: true,
                secure: false,
            },
        },
        allowedHosts: ['.ngrok-free.app', '.ngrok-free.app:5173', '9028-92-238-144-108.ngrok-free.app'], // <-- add this
    },
});
