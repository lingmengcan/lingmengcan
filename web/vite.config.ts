import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import tailwindcss from '@tailwindcss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { TDesignResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    tailwindcss(),
    AutoImport({
      resolvers: [
        TDesignResolver({
          library: 'vue-next',
        }),
      ],
    }),
    // 自动按需引入TDesign组件
    Components({
      resolvers: [
        TDesignResolver({
          library: 'vue-next',
        }),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    hmr: true,
    port: 8089,
    proxy: {
      // 选项写法
      '/api': {
        target: 'http://localhost:9999',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/aigc-files': {
        target: 'http://localhost:9999',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/aigc-files/, 'aigc-files'),
      },
      '/upload-files': {
        target: 'http://localhost:9999',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/upload-files/, 'upload-files'),
      },
      '/sdweb': {
        target: 'http://localhost:7861',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sdweb/, ''),
      },
    },
  },
  esbuild: {
    /** 打包时移除 console.log */
    pure: ['console.log'],
    /** 打包时移除 debugger */
    drop: ['debugger'],
    /** 打包时移除所有注释 */
    legalComments: 'none',
  },
});
