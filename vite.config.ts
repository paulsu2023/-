import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, '.', '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    // ⚠️ 这一点很重要：保留原有的路径别名，否则会报错
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    // ⚠️ 关键修复：解决白屏问题
    define: {
      // 1. 给 process 一个空对象，防止浏览器直接调用 process.env 崩溃
      'process.env': {},
      
      // 2. 显式注入 API Key (同时兼容你 Vercel 设置的 VITE_ 开头变量)
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY)
    }
  };
});
