import { RouteRecordRaw } from 'vue-router';

export const RedirectName = 'Redirect';

export const ErrorPage = () => import('@/views/error/404.vue');

export const Layout = () => import('@/layouts/index.vue');
export const AdminLayout = () => import('@/layouts/admin.vue');
export const ParentLayout = () => import('@/layouts/parent.vue');

export const RootRoute: RouteRecordRaw = {
  path: '/',
  name: 'Root',
  redirect: '/dashboard',
  meta: {
    title: 'Root',
  },
};

export const LoginRoute: RouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('@/views/login.vue'),
  meta: {
    title: '登录',
  },
};

// 404 on a page
export const ErrorPageRoute: RouteRecordRaw = {
  path: '/:path(.*)*',
  name: 'ErrorPage',
  component: Layout,
  meta: {
    title: 'ErrorPage',
    hideBreadcrumb: true,
  },
  children: [
    {
      path: '/:path(.*)*',
      name: 'ErrorPageSon',
      component: ErrorPage,
      meta: {
        title: 'ErrorPage',
        hideBreadcrumb: true,
      },
    },
  ],
};

export const RedirectRoute: RouteRecordRaw = {
  path: '/redirect',
  name: RedirectName,
  component: Layout,
  meta: {
    title: RedirectName,
    hideBreadcrumb: true,
  },
  children: [
    {
      path: '/redirect/:path(.*)',
      name: RedirectName + 'Son',
      component: () => import('@/views/redirect.vue'),
      meta: {
        title: RedirectName + 'Son',
        hideBreadcrumb: true,
      },
    },
  ],
};
