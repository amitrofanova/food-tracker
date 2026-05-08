import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/home'),
  },
  {
    path: '/search/:mealType',
    name: 'search',
    component: () => import('@/pages/search'),
    props: true,
  },
  {
    path: '/calorie-calculator',
    name: 'calorie-calculator',
    component: () => import('@/pages/calorie-calculator'),
  },
  {
    path: '/my-products',
    name: 'my-products',
    component: () => import('@/pages/my-products'),
  },
  {
    path: '/recipes',
    name: 'recipes',
    component: () => import('@/pages/recipes'),
  },
];
