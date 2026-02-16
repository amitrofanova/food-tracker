import { defineStore } from 'pinia';
import LOCAL_FOODS from '@/shared/assets/mock.json';
import type { IProduct } from './types';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: LOCAL_FOODS,
    searchResults: [] as IProduct[],
  }),
  actions: {
    search(query: string) {
      this.searchResults = this.products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()),
      );
    },
  },
});
