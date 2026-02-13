import { ref, onMounted } from 'vue';
import { FoodApiService } from '../api/api.service';
import { LocalFoodService } from '../model/local-data.service';
import { FoodCacheService } from '../model/cache.service';
import { useFoodTrackingStore } from '@/features/food-tracking';
import type { FoodItem } from '@/types';

export const useFoodSearch = () => {
  const apiService = new FoodApiService();
  const localService = new LocalFoodService();
  const cacheService = new FoodCacheService();
  const foodTrackingStore = useFoodTrackingStore();

  const searchResults = ref<FoodItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const offlineMode = ref(!navigator.onLine);

  onMounted(() => {
    cacheService.loadCacheFromStorage();
    window.addEventListener('online', () => {
      offlineMode.value = false;
    });
    window.addEventListener('offline', () => {
      offlineMode.value = true;
    });
  });

  const hasName = (product: any): boolean => {
    return product.product_name || product.product_name_ru;
  };

  const isValidNutritionData = (product: any): boolean => {
    const nutriments = product.nutriments || {};
    return (
      !!(nutriments['energy-kcal_100g'] || nutriments['energy_100g']) &&
      (nutriments.proteins_100g || nutriments.fat_100g || nutriments.carbohydrates_100g)
    );
  };

  const sortProductsByRelevance = (products: any[], query: string): any[] => {
    const normalizedQuery = query.toLowerCase().trim();

    return [...products].sort((a, b) => {
      const nameA = (a.product_name_ru || a.product_name || '').toLowerCase().trim();
      const nameB = (b.product_name_ru || b.product_name || '').toLowerCase().trim();

      // 1. Точное совпадение
      if (nameA === normalizedQuery && nameB !== normalizedQuery) return -1;
      if (nameA !== normalizedQuery && nameB === normalizedQuery) return 1;

      // 2. Название начинается с запроса
      if (nameA.startsWith(normalizedQuery) && !nameB.startsWith(normalizedQuery)) return -1;
      if (!nameA.startsWith(normalizedQuery) && nameB.startsWith(normalizedQuery)) return 1;

      // 3. Более короткое название
      if (nameA.length < nameB.length) return -1;
      if (nameA.length > nameB.length) return 1;

      // 4. По популярности
      const popularityA = a.unique_scans_n || 0;
      const popularityB = b.unique_scans_n || 0;
      return popularityB - popularityA;
    });
  };

  const transformApiProductToFoodItem = (product: any): FoodItem => {
    const nutriments = product.nutriments || {};
    const energyPer100g =
      nutriments['energy-kcal_100g'] ||
      (nutriments['energy_100g'] ? Math.round(nutriments['energy_100g'] / 4.184) : 0);

    const name = product.product_name_ru || product.product_name || product.generic_name || '';

    return {
      id: product.code || crypto.randomUUID(),
      name: name,
      calories: Math.round(energyPer100g),
      protein: Math.round(nutriments.proteins_100g || 0),
      fat: Math.round(nutriments.fat_100g || 0),
      carbs: Math.round(nutriments.carbohydrates_100g || 0),
      source: 'api',
    };
  };

  const removeDuplicates = (foods: FoodItem[]): FoodItem[] => {
    const seen = new Set<string>();
    return foods.filter((food) => {
      const key = `${food.name.toLowerCase()}_${food.calories}_${food.protein}_${food.fat}_${food.carbs}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const clearResults = () => {
    searchResults.value = [];
  };

  const fallbackToLocalSearch = (query: string) => {
    const localResults = localService.search(query);

    const customResults = foodTrackingStore.customFoods
      .filter((food) => food.name.toLowerCase().includes(query.toLowerCase()))
      .map((food) => ({
        ...food,
        id: food.id || crypto.randomUUID(),
        source: 'custom',
      }));

    const results = [...localResults, ...customResults];
    searchResults.value = results.slice(0, 10);
  };

  const searchFoods = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      searchResults.value = [];
      return;
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const cacheKey = `${normalizedQuery}`;

    const cachedResults = cacheService.get(cacheKey);
    if (cachedResults) {
      searchResults.value = cacheService.get(cacheKey)!;
      return;
    }

    loading.value = true;
    error.value = null;
    searchResults.value = [];

    try {
      // 1. Поиск в локальной базе
      const localResults = localService.search(normalizedQuery);

      // 2. Добавляем кастомные продукты
      const customResults = foodTrackingStore.customFoods
        .filter((food) => food.name.toLowerCase().includes(normalizedQuery))
        .map((food) => ({
          ...food,
          id: food.id || crypto.randomUUID(),
          source: 'custom',
        }));

      // 3. Объединяем локальные и кастомные результаты
      let combinedResults = [...localResults, ...customResults];

      // 4. Если есть результаты, показываем их
      if (combinedResults.length > 0) {
        searchResults.value = combinedResults;
      }

      // 5. Если офлайн или достаточно результатов - пропускаем API
      if (offlineMode.value || combinedResults.length >= 10) {
        if (searchResults.value.length === 0) {
          fallbackToLocalSearch(normalizedQuery);
        }
        return;
      }

      // 6. Запрос к API
      const apiResults = await apiService.searchFoods(normalizedQuery);

      // 7. Фильтрация и сортировка результатов
      const validProducts = apiResults.filter(hasName).filter(isValidNutritionData);
      if (validProducts.length === 0) {
        if (searchResults.value.length === 0) {
          fallbackToLocalSearch(normalizedQuery);
        }
        return;
      }

      const sortedProducts = sortProductsByRelevance(validProducts, normalizedQuery);
      const transformedApiResults = sortedProducts.map(transformApiProductToFoodItem);

      // 8. Фильтрация дубликатов
      const uniqueApiResults = transformedApiResults.filter((apiItem) => {
        return !combinedResults.some((existingItem) => {
          const nameSimilarity = existingItem.name.toLowerCase() === apiItem.name.toLowerCase();
          const nutritionSimilarity =
            Math.abs(existingItem.protein - apiItem.protein) <= 0.1 &&
            Math.abs(existingItem.fat - apiItem.fat) <= 0.1 &&
            Math.abs(existingItem.carbs - apiItem.carbs) <= 0.1;

          return nameSimilarity && nutritionSimilarity;
        });
      });

      // 9. Объединение всех результатов
      combinedResults = [...combinedResults, ...uniqueApiResults];

      // 10. Ограничиваем количество и убираем дубликаты
      searchResults.value = removeDuplicates(combinedResults).slice(0, 12);

      // 11. СОХРАНЕНИЕ В КЭШ
      if (searchResults.value.length > 0) {
        cacheService.set(cacheKey, searchResults.value);
      }
    } catch (err) {
      console.warn('Ошибка при поиске, используем локальную базу:', err);
      fallbackToLocalSearch(normalizedQuery);
    } finally {
      loading.value = false;
    }
  };

  return {
    searchResults,
    loading,
    error,
    offlineMode,
    searchFoods,
    clearResults,
  };
};
