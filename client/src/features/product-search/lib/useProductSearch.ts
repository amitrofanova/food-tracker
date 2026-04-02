// src/features/product-search/lib/useProductSearch.ts
import { ref, computed } from 'vue';
import { useInfiniteQuery } from '@tanstack/vue-query';
import { productDb } from '@/shared/db/productDb';
import { searchProducts as searchApi } from '../api/openFoodFactsApi';
import { mapOpenFoodFactsToProduct } from '../model/mappers';
import type { OpenFoodFactsProduct } from '../model/mappers';
import { useDebounce } from '@/shared/lib/debounce';

export function useProductSearch() {
  const searchQuery = ref('');
  const MIN_QUERY_LENGTH = 2;

  const hasMinimumValidData = (product: OpenFoodFactsProduct): boolean => {
    const name = product.product_name;
    const nutriments = product.nutriments;

    return !!(
      name &&
      nutriments &&
      (nutriments['energy-kcal_100g'] || nutriments['energy_100g']) &&
      (nutriments.proteins_100g || nutriments.fat_100g || nutriments.carbohydrates_100g)
    );
  };

  // Реактивный queryKey через вычисляемое свойство
  const queryKey = computed(() => ['product-search', searchQuery.value.trim()]);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading, error } =
    useInfiniteQuery({
      queryKey, // ← реактивный ключ
      queryFn: async ({ pageParam = 1 }) => {
        // Локальные продукты загружаем ТОЛЬКО на первой странице
        let localProducts: Product[] = [];
        if (pageParam === 1 && searchQuery.value.trim().length > MIN_QUERY_LENGTH) {
          const [customProducts, dbProducts] = await Promise.all([
            productDb.getCustomProducts(searchQuery.value),
            productDb.getProducts(searchQuery.value),
          ]);
          localProducts = [...customProducts, ...dbProducts];
        }

        // Запрос к API
        const apiResponse = await searchApi(searchQuery.value, pageParam);

        const apiProducts = apiResponse.products
          .filter(hasMinimumValidData)
          .map(mapOpenFoodFactsToProduct);

        // Сохраняем в БД только новые продукты (избегаем дублирования)
        if (apiProducts.length > 0 && pageParam === 1) {
          await productDb.products.bulkPut(apiProducts);
        }

        return {
          products: pageParam === 1 ? [...localProducts, ...apiProducts] : apiProducts,
          nextPage: apiResponse.page < apiResponse.page_count ? pageParam + 1 : undefined,
        };
      },
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: 1, // ← ОБЯЗАТЕЛЬНЫЙ ПАРАМЕТР
      enabled: computed(() => searchQuery.value.trim().length > MIN_QUERY_LENGTH),
      staleTime: 5 * 60 * 1000,
      // keepPreviousData: true, // опционально: сохранять предыдущие результаты при смене запроса
    });

  const allProducts = computed(() => {
    if (!data.value) return [];
    return data.value.pages.flatMap((page) => page.products);
  });

  // Дебаунс для поискового запроса
  const debouncedSetQuery = useDebounce((q: string) => {
    searchQuery.value = q;
    // TanStack Query автоматически перезапустит запрос при изменении queryKey
  }, 500);

  return {
    searchQuery,
    setSearchQuery: debouncedSetQuery,
    results: allProducts,
    loading: isLoading,
    isFetchingNextPage,
    error: computed(() => error.value?.message || null),
    hasMore: hasNextPage,
    loadMore: fetchNextPage,
  };
}
