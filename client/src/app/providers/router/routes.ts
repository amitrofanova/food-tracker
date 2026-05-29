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
    meta: { hideHeaderOnMobile: true },
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
    meta: { hideHeaderOnMobile: true },
  },
  {
    path: '/recipes',
    name: 'recipes',
    component: () => import('@/pages/recipes'),
    meta: { hideHeaderOnMobile: true },
  },
  {
    path: '/recipes/:id',
    name: 'recipe-detail',
    component: () => import('@/pages/recipe-detail'),
    props: true,
  },
];
