import { defineStore } from 'pinia';
import type { IProduct } from '@/entities/product';

export const useSearchStore = defineStore('search', {
  state: () => ({
    query: '',
    results: [] as IProduct[],
    loading: false,
    error: null as string | null,
    hasMore: true,
    currentPage: 1,
  }),

  actions: {
    setQuery(query: string) {
      this.query = query;
    },
    setResults(results: IProduct[]) {
      this.results = results;
    },
    appendResults(newResults: IProduct[]) {
      const existingIds = new Set(this.results.map((p) => p.id));
      const uniqueNew = newResults.filter((p) => !existingIds.has(p.id));
      this.results.push(...uniqueNew);
    },
    setLoading(loading: boolean) {
      this.loading = loading;
    },
    setError(error: string | null) {
      this.error = error;
    },
    setHasMore(hasMore: boolean) {
      this.hasMore = hasMore;
    },
    setCurrentPage(page: number) {
      this.currentPage = page;
    },
    reset() {
      this.query = '';
      this.results = [];
      this.loading = false;
      this.error = null;
      this.hasMore = true;
      this.currentPage = 1;
    },
  },
});
