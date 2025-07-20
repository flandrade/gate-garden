import { defineConfig } from 'vite';
import { resolve } from 'path';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
    },
    server: {
        port: 8080,
        open: true
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, '../src'),
        }
    }
});