import './styles/tailwind.css';

import { createApp } from 'vue';
// 引入组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css';
import { setupDirectives } from '@/plugins';

import App from './App.vue';

import router, { setupRouter } from './router';
import { store } from './store';
import i18n from './locales';

import { VueMasonryPlugin } from 'vue-masonry';

async function bootstrap() {
  const app = createApp(App);

  // 挂载状态管理
  app.use(store);

  // TDesign 组件已通过 unplugin-vue-components 自动按需导入

  // 注册全局自定义指令，如：v-permission权限指令
  setupDirectives(app);

  // 挂载路由
  setupRouter(app);

  // 瀑布流
  app.use(VueMasonryPlugin);

  // 多语言
  app.use(i18n);

  // 路由准备就绪后挂载 APP 实例
  // https://router.vuejs.org/api/interfaces/router.html#isready
  await router.isReady();

  // TDesign 样式已正确加载

  app.mount('#app');
}

void bootstrap();
