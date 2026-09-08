/// <reference types="vite/client" />

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    hideHeaderOnMobile?: boolean;
  }
}
