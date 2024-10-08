import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/',
  server: {
    port: 3000,
  },
  plugins: [react()],
  publicDir: path.resolve(__dirname, 'public'),
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      {
        find: '@components',
        replacement: path.resolve(__dirname, 'src/components'),
      },
    ],
  },
  define: {
    global: 'window',
  },
  build: {
    outDir: 'dist', // dist 아래에 빌드됨
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        // 모든 자산 파일을 파일명에 해시를 붙여서 assets 폴더에 복사
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
});
