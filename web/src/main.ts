import './styles/tailwind.css';

import { createApp } from 'vue';
// 引入组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css';
import { setupDirectives, setupNaiveDiscreteApi } from '@/plugins';

import App from './App.vue';

import router, { setupRouter } from './router';
import { store } from './store';
import i18n from './locales';

import { VueMasonryPlugin } from 'vue-masonry';

async function bootstrap() {
  const app = createApp(App);

  // 挂载状态管理
  app.use(store);

  // 注册全局常用的 naive-ui 组件
  // setupNaive(app);
  // 挂载 naive-ui 脱离上下文的 Api
  setupNaiveDiscreteApi();

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

  // 解决naive 样式被tailwind 覆盖问题
  // https://www.naiveui.com/en-US/os-theme/docs/style-conflict#About-Tailwind's-Preflight-Style-Override
  const meta = document.createElement('meta');
  meta.name = 'naive-ui-style';
  document.head.appendChild(meta);

  app.mount('#app');
}

void bootstrap();
