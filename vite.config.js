// vite.config.js

import { defineConfig } from 'vite';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  base: './', // 상대 경로를 위해 './'로 설정합니다.
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInclude: ['**/*.svg'],
  },
  plugins: [
    commonjs(),
  ],
});
