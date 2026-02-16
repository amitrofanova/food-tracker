import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

export const app = createApp(App).use(createPinia());
