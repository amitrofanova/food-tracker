import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSearchStore } from '../model/searchStore';
import { searchProducts } from '../api/openFoodFactsApi';
import { mapOpenFoodFactsToProduct } from '../model/mappers';
import type { OpenFoodFactsProduct } from '../model/mappers';
import { useDebounce } from '@/shared/lib/debounce';
import { productDb } from '@/shared/db/productDb';

export function useProductSearch() {
  const searchStore = useSearchStore();

  const { results, loading, error, hasMore } = storeToRefs(searchStore);

  const searchQuery = ref('');

  const MIN_QUERY_LENGTH = 2;

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
    if (q.trim().length <= MIN_QUERY_LENGTH) {
      searchStore.setResults([]);
      return;
    }

    searchStore.setLoading(true);
    searchStore.setError(null);

    try {
      const localProducts = await productDb.products
        .where('name')
        .startsWithIgnoreCase(q)
        .limit(10)
        .toArray();

      if (localProducts.length > 0) {
        searchStore.setResults(localProducts);
      }

      // TODO
      // https://developers.google.com/safe-browsing/v4/caching?hl=ru
      // https://platformv.sbertech.ru/docs/public/VDB/1.0.0/common/documents/tutorials/reranking-hybrid-search.html
      // https://learn.microsoft.com/kk-kz/azure/search/hybrid-search-how-to-query#set-maxtextrecallsize-and-countandfacetmode-preview
      const apiResponse = await searchProducts(q, 1);
      const apiProducts = apiResponse.products
        .filter(hasMinimumValidData)
        .map(mapOpenFoodFactsToProduct);
      console.log('apiResponse', apiResponse);
      console.log('apiProducts', apiProducts);

      if (apiProducts.length > 0) {
        await productDb.products.bulkPut(apiProducts);
      }

      const allProducts = [...localProducts];
      const localIds = new Set(localProducts.map((p) => p.id));

      for (const prod of apiProducts) {
        if (!localIds.has(prod.id)) {
          allProducts.push(prod);
        }
      }

      searchStore.setResults(allProducts);
      searchStore.setHasMore(apiResponse.page < apiResponse.page_count);
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
    if (!hasMore.value || loading.value || searchQuery.value.trim().length <= MIN_QUERY_LENGTH)
      return;

    const nextPage = searchStore.currentPage + 1;
    searchStore.setLoading(true);

    try {
      const apiResponse = await searchProducts(searchQuery.value, nextPage);
      const apiProducts = apiResponse.products
        .filter(hasMinimumValidData)
        .map(mapOpenFoodFactsToProduct);

      await productDb.products.bulkPut(apiProducts);
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
