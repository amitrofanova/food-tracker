import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSearchStore } from '../model/searchStore';
import { searchProducts } from '../api/openFoodFactsApi';
import { mapOpenFoodFactsToProduct } from '../model/mappers';
import type { OpenFoodFactsProduct } from '../model/mappers';
import { useDebounce } from '@/shared/lib/debounce';
import type { IProduct } from '@/entities/product';

export function useProductSearch() {
  const searchStore = useSearchStore();
  const { query, results, loading, error, hasMore } = storeToRefs(searchStore);

  const searchQuery = ref('');

  const hasMinimumValidData = (product: OpenFoodFactsProduct): boolean => {
    const name = product.product_name || product.product_name_ru;
    const nutriments = product.nutriments || {};

    return !!(
      name &&
      (nutriments['energy-kcal_100g'] || nutriments['energy_100g']) &&
      (nutriments.proteins_100g || nutriments.fat_100g || nutriments.carbohydrates_100g)
    );
  };

  const debouncedSearch = useDebounce(async (q: string) => {
    if (q.trim().length < 3) {
      searchStore.setResults([]);
      return;
    }

    searchStore.setLoading(true);
    searchStore.setError(null);

    try {
      const apiResponse = await searchProducts(q, 1);
      const apiProducts = apiResponse.products
        .filter(hasMinimumValidData)
        .map(mapOpenFoodFactsToProduct);
      console.log('apiResponse', apiResponse);
      console.log('apiProducts', apiProducts);

      searchStore.setResults(apiProducts);
    } catch (err) {
      console.error('Search error:', err);
      searchStore.setError('Search error');
    } finally {
      searchStore.setLoading(false);
    }
  }, 300);

  watch(searchQuery, (newQuery) => {
    searchStore.setQuery(newQuery);
    debouncedSearch(newQuery);
  });

  const loadMore = async () => {
    if (!hasMore.value || loading.value) return;

    const nextPage = searchStore.currentPage + 1;
    searchStore.setLoading(true);

    try {
      const apiResponse = await searchProducts(searchQuery.value, nextPage);
      const apiProducts = apiResponse.products.map(mapOpenFoodFactsToProduct);

      searchStore.appendResults(apiProducts);
      searchStore.setCurrentPage(nextPage);
      searchStore.setHasMore(apiResponse.page < apiResponse.page_count);
    } catch (err) {
      console.error('Load more error:', err);
    } finally {
      searchStore.setLoading(false);
    }
  };

  return {
    searchQuery,
    results,
    loading,
    error,
    hasMore,
    loadMore,
  };
}
