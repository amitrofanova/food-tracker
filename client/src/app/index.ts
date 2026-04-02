import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import { router } from './providers/router';

export const app = createApp(App).use(createPinia()).use(router).use(VueQueryPlugin);
