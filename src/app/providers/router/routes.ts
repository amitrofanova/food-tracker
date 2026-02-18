import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/home'),
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/pages/search'),
    props: true,
  },
];
