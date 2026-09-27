import { useInfiniteQuery, type InfiniteData } from "@tanstack/vue-query";
import { useCustomProductStore, type IProduct } from "@/entities/product";
import { useRecipeStore, type IRecipe } from "@/entities/recipe";
import { db } from "@/shared/db";
import { useDebounce } from "@/shared/lib/debounce";
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

function recipeAsProduct(recipe: IRecipe): IProduct {
  return {
    id: recipe.id,
    name: recipe.name,
    calories: recipe.calories,
    protein: recipe.protein,
    fat: recipe.fat,
    carbs: recipe.carbs,
  };
}

export const useProductSearch = () => {
  const customProductStore = useCustomProductStore();
  const recipeStore = useRecipeStore();
  const searchQuery = ref<string>("");
  const cachedProducts = ref<IProduct[]>([]);
  const cacheLoading = ref(false);
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

  watch(
    trimmedQuery,
    async (query) => {
      if (query.length < MIN_QUERY_LENGTH) {
        cachedProducts.value = [];
        cacheLoading.value = false;
        return;
      }

      cacheLoading.value = true;
      try {
        const rows = await db.getProducts(query);
        if (trimmedQuery.value !== query) return;
        cachedProducts.value = rows;
        dbError.value = null;
      } catch (err) {
        if (trimmedQuery.value !== query) return;
        dbError.value = err instanceof Error ? err.message : "Ошибка загрузки продуктов";
        console.error("Failed to load local products:", err);
        cachedProducts.value = [];
      } finally {
        if (trimmedQuery.value === query) cacheLoading.value = false;
      }
    },
    { immediate: true },
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isApiLoading,
    error,
  } = useInfiniteQuery<ApiProductsPage, Error, ApiProductsPages, [string, string], number>({
    queryKey: computed(() => ["off-products", trimmedQuery.value]),
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

  const ownedMatches = computed<IProduct[]>(() => {
    if (!isEnabled.value) return [];
    const query = trimmedQuery.value.toLowerCase();
    const custom = customProductStore.products.filter((product) =>
      product.name.toLowerCase().startsWith(query),
    );
    const recipes = recipeStore.recipes
      .filter((recipe) => recipe.name.toLowerCase().includes(query))
      .map(recipeAsProduct);
    return [...custom, ...recipes];
  });

  const allProducts = computed<IProduct[]>(() => {
    const seen = new Set<string>();
    const merged: IProduct[] = [];
    pushUnique(merged, seen, ownedMatches.value);
    pushUnique(merged, seen, cachedProducts.value);
    pushUnique(merged, seen, data.value?.pages.flatMap((page) => page.products) || []);
    return rankProductsByQuery(merged, trimmedQuery.value);
  });

  const isInitialLoading = computed(
    () =>
      isEnabled.value &&
      allProducts.value.length === 0 &&
      (isApiLoading.value ||
        cacheLoading.value ||
        customProductStore.isLoading ||
        recipeStore.isLoading),
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
