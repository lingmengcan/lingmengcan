import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';
import { ForgetPasswordRoute, LoginRoute, RedirectRoute, RootRoute } from '@/router/basic';
import { App } from 'vue';
import { createRouterGuards } from './guards';

export interface ModuleType {
  default: Array<RouteRecordRaw> | RouteRecordRaw;
}

const modules = import.meta.glob<ModuleType>('./modules/**/*.ts', { eager: true });

const routeModuleList: RouteRecordRaw[] = Object.values(modules).flatMap((module) => {
  const mod = module.default ?? {};
  return Array.isArray(mod) ? mod : [mod];
});

function sortRoute(a, b): number {
  return (a.meta?.sort ?? 0) - (b.meta?.sort ?? 0);
}

routeModuleList.sort(sortRoute);

//需要验证权限
export const asyncRoutes = [...routeModuleList];

//普通路由 无需验证权限
export const defaultRoutes: RouteRecordRaw[] = [LoginRoute, ForgetPasswordRoute, RootRoute, RedirectRoute];

const router = createRouter({
  history: createWebHistory(),
  routes: defaultRoutes,
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

export function setupRouter(app: App) {
  app.use(router);
  // 创建路由守卫
  createRouterGuards(router);
}

export default router;
