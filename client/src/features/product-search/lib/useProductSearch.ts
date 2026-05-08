import { useQuery, useInfiniteQuery, type InfiniteData } from '@tanstack/vue-query';
import { db } from '@/shared/db';
import { useDebounce } from '@/shared/lib/debounce';
import type { IProduct } from '@/entities/product';
import { searchProducts as searchApi } from '../api/openFoodFactsApi';
import { mapOpenFoodFactsToProduct, type OpenFoodFactsProduct } from '../model/mappers';

interface ApiProductsPage {
  products: IProduct[];
  nextPage: number | undefined;
}

type ApiProductsPages = InfiniteData<ApiProductsPage, number>;

export const useProductSearch = () => {
  const searchQuery = ref<string>('');
  const dbError = ref<string | null>(null);
  const MIN_QUERY_LENGTH = 2;
  const SUFFICIENT_LOCAL_RESULTS_LENGTH = 10;
  const STALE_TIME = 300000; // 5 * 60 * 1000

  const isValid = (product: OpenFoodFactsProduct): boolean => {
    const name = product.product_name;
    const nutriments = product.nutriments;
    return !!(
      name &&
      nutriments &&
      (nutriments['energy-kcal_100g'] || nutriments['energy_100g']) &&
      (nutriments.proteins_100g || nutriments.fat_100g || nutriments.carbohydrates_100g)
    );
  };

  const isEnabled = computed(() => searchQuery.value.trim().length >= MIN_QUERY_LENGTH);

  const { data: customProductsData } = useQuery<IProduct[]>({
    queryKey: computed(() => ['custom-products', searchQuery.value.trim()]),
    queryFn: async () => {
      try {
        dbError.value = null;
        return await db.getCustomProducts(searchQuery.value);
      } catch (err) {
        dbError.value = err instanceof Error ? err.message : 'Failed to load custom products';
        console.error('Failed to load custom products:', err);
        return [];
      }
    },
    enabled: isEnabled,
    staleTime: Infinity,
  });

  const { data: recipesData } = useQuery<IProduct[]>({
    queryKey: computed(() => ['recipes-search', searchQuery.value.trim()]),
    queryFn: async () => {
      try {
        const q = searchQuery.value.trim().toLowerCase();
        const all = await db.getAllRecipes();
        return all.filter((r) => r.name.toLowerCase().includes(q)) as IProduct[];
      } catch (err) {
        console.error('Failed to load recipes for search:', err);
        return [];
      }
    },
    enabled: isEnabled,
    staleTime: Infinity,
  });

  const { data: cachedProductsData } = useQuery<IProduct[]>({
    queryKey: computed(() => ['cached-products', searchQuery.value.trim()]),
    queryFn: async () => {
      try {
        return await db.getProducts(searchQuery.value);
      } catch (err) {
        dbError.value = err instanceof Error ? err.message : 'Failed to load local products';
        console.error('Failed to load local products:', err);
        return [];
      }
    },
    enabled: isEnabled,
    staleTime: Infinity,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQuery<ApiProductsPage, Error, ApiProductsPages, [string, string], number>({
      queryKey: computed(() => ['api-products', searchQuery.value.trim()]),
      queryFn: async ({ pageParam = 1 }) => {
        try {
          dbError.value = null;
          if (pageParam === 1) {
            const localCount =
              (customProductsData.value?.length ?? 0) + (cachedProductsData.value?.length ?? 0);
            if (localCount >= SUFFICIENT_LOCAL_RESULTS_LENGTH) {
              return { products: [], nextPage: undefined };
            }
          }

          const apiResponse = await searchApi(searchQuery.value, pageParam);
          const apiProducts = apiResponse.products.filter(isValid).map(mapOpenFoodFactsToProduct);

          if (apiProducts.length > 0 && pageParam === 1) {
            await db.products.bulkPut(apiProducts);
          }

          return {
            products: apiProducts,
            nextPage: apiResponse.page < apiResponse.page_count ? pageParam + 1 : undefined,
          };
        } catch (err) {
          dbError.value = err instanceof Error ? err.message : 'Failed to search products';
          console.error('Failed to search products:', err);
          throw err;
        }
      },
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: 1,
      enabled: isEnabled,
      staleTime: STALE_TIME,
    });

  const allProducts = computed<IProduct[]>(() => {
    const custom = customProductsData.value || [];
    const recipes = recipesData.value || [];
    const cached = cachedProductsData.value || [];
    const apiPages = data.value?.pages.flatMap((page) => page.products) || [];
    return [...custom, ...recipes, ...cached, ...apiPages];
  });

  const debouncedSetQuery = useDebounce((q: string) => {
    searchQuery.value = q;
  }, 500);

  return {
    searchQuery,
    setSearchQuery: debouncedSetQuery,
    results: allProducts,
    loading: isLoading,
    isFetchingNextPage,
    error: computed(() => error.value?.message || dbError.value || null),
    hasMore: hasNextPage,
    loadMore: fetchNextPage,
  };
};
