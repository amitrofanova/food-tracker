import { useQuery, useInfiniteQuery, type InfiniteData } from "@tanstack/vue-query";
import { db } from "@/shared/db";
import { useDebounce } from "@/shared/lib/debounce";
import type { IProduct } from "@/entities/product";
import { searchProducts as searchApi } from "../api/openFoodFactsApi";
import { mapOpenFoodFactsToProduct, type OpenFoodFactsProduct } from "../model/mappers";
import { rankProductsByQuery } from "./rankProductsByQuery";

interface ApiProductsPage {
  products: IProduct[];
  nextPage: number | undefined;
}

type ApiProductsPages = InfiniteData<ApiProductsPage, number>;

const pushUnique = (target: IProduct[], seen: Set<string>, items: IProduct[]) => {
  for (const product of items) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    target.push(product);
  }
};

export const useProductSearch = () => {
  const searchQuery = ref<string>("");
  const dbError = ref<string | null>(null);
  const MIN_QUERY_LENGTH = 2;
  const STALE_TIME = 300000; // 5 * 60 * 1000

  const isValid = (product: OpenFoodFactsProduct): boolean => {
    const name = product.product_name;
    const nutriments = product.nutriments;
    return !!(
      product.code &&
      name &&
      nutriments &&
      (nutriments["energy-kcal_100g"] || nutriments["energy_100g"]) &&
      (nutriments.proteins_100g || nutriments.fat_100g || nutriments.carbohydrates_100g)
    );
  };

  const trimmedQuery = computed(() => searchQuery.value.trim());
  const isEnabled = computed(() => trimmedQuery.value.length >= MIN_QUERY_LENGTH);

  const { data: customProductsData, isFetching: customFetching } = useQuery<IProduct[]>({
    queryKey: computed(() => ["custom-products", trimmedQuery.value]),
    queryFn: async () => {
      try {
        dbError.value = null;
        return await db.getCustomProducts(searchQuery.value);
      } catch (err) {
        dbError.value =
          err instanceof Error ? err.message : "Ошибка загрузки пользовательских продуктов";
        console.error("Failed to load custom products:", err);
        return [];
      }
    },
    enabled: isEnabled,
    staleTime: Infinity,
  });

  const { data: recipesData, isFetching: recipesFetching } = useQuery<IProduct[]>({
    queryKey: computed(() => ["recipes-search", trimmedQuery.value]),
    queryFn: async () => {
      try {
        const q = trimmedQuery.value.toLowerCase();
        const all = await db.getAllRecipes();
        return all.filter((r) => r.name.toLowerCase().includes(q)) as IProduct[];
      } catch (err) {
        console.error("Failed to load recipes for search:", err);
        return [];
      }
    },
    enabled: isEnabled,
    staleTime: Infinity,
  });

  const { data: cachedProductsData, isFetching: cachedFetching } = useQuery<IProduct[]>({
    queryKey: computed(() => ["cached-products", trimmedQuery.value]),
    queryFn: async () => {
      try {
        return await db.getProducts(searchQuery.value);
      } catch (err) {
        dbError.value = err instanceof Error ? err.message : "Ошибка загрузки продуктов";
        console.error("Failed to load local products:", err);
        return [];
      }
    },
    enabled: isEnabled,
    staleTime: Infinity,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isApiLoading,
    error,
  } = useInfiniteQuery<ApiProductsPage, Error, ApiProductsPages, [string, string], number>({
    // 'paged' busts caches from the old "skip API when local is enough" queryFn
    queryKey: computed(() => ["api-products-paged", trimmedQuery.value]),
    queryFn: async ({ pageParam = 1 }) => {
      try {
        dbError.value = null;
        const apiResponse = await searchApi(trimmedQuery.value, pageParam);
        const apiProducts = apiResponse.products.filter(isValid).map(mapOpenFoodFactsToProduct);

        if (apiProducts.length > 0) {
          try {
            await db.products.bulkPut(apiProducts);
          } catch (err) {
            console.error("Failed to cache products in IndexedDB:", err);
          }
        }

        return {
          products: apiProducts,
          nextPage: apiResponse.page < apiResponse.page_count ? pageParam + 1 : undefined,
        };
      } catch (err) {
        dbError.value = err instanceof Error ? err.message : "Ошибка поиска продуктов";
        console.error("Failed to search products:", err);
        throw err;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    enabled: isEnabled,
    staleTime: STALE_TIME,
  });

  const allProducts = computed<IProduct[]>(() => {
    const seen = new Set<string>();
    const merged: IProduct[] = [];
    pushUnique(merged, seen, customProductsData.value || []);
    pushUnique(merged, seen, recipesData.value || []);
    pushUnique(merged, seen, cachedProductsData.value || []);
    pushUnique(merged, seen, data.value?.pages.flatMap((page) => page.products) || []);
    return rankProductsByQuery(merged, trimmedQuery.value);
  });

  const localFetching = computed(
    () => customFetching.value || recipesFetching.value || cachedFetching.value,
  );

  const isInitialLoading = computed(
    () =>
      isEnabled.value &&
      allProducts.value.length === 0 &&
      (isApiLoading.value || localFetching.value),
  );

  const isFetchingMore = computed(
    () => isFetchingNextPage.value || (allProducts.value.length > 0 && isApiLoading.value),
  );

  const debouncedSetQuery = useDebounce((q: string) => {
    searchQuery.value = q;
  }, 500);

  return {
    searchQuery,
    setSearchQuery: debouncedSetQuery,
    results: allProducts,
    loading: isInitialLoading,
    isFetchingMore,
    isFetchingNextPage,
    error: computed(() => error.value?.message || dbError.value || null),
    hasMore: hasNextPage,
    loadMore: fetchNextPage,
  };
};
