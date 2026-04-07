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

  const { data: localProducts } = useQuery<IProduct[]>({
    queryKey: computed(() => ['local-products', searchQuery.value.trim()]),
    queryFn: async () => {
      const [custom, apiProducts] = await Promise.all([
        db.getCustomProducts(searchQuery.value),
        db.getProducts(searchQuery.value),
      ]);
      return [...custom, ...apiProducts];
    },
    enabled: computed(() => searchQuery.value.trim().length > MIN_QUERY_LENGTH),
    staleTime: Infinity,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQuery<ApiProductsPage, Error, ApiProductsPages, [string, string], number>({
      queryKey: computed(() => ['api-products', searchQuery.value.trim()]),
      queryFn: async ({ pageParam = 1 }) => {
        if (pageParam === 1) {
          const localCount = localProducts.value?.length ?? 0;
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
      },
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: 1,
      enabled: computed(() => searchQuery.value.trim().length > MIN_QUERY_LENGTH),
      staleTime: STALE_TIME,
    });

  const allProducts = computed<IProduct[]>(() => {
    const local = localProducts.value || [];
    const apiPages = data.value?.pages.flatMap((page) => page.products) || [];
    return [...local, ...apiPages];
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
    error: computed(() => error.value?.message || null),
    hasMore: hasNextPage,
    loadMore: fetchNextPage,
  };
};
