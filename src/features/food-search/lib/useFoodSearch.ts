import { ref, onMounted, computed } from 'vue';
import { searchFoods, searchByBarcode } from '@/app/services/apiService';
import { searchLocalFoods } from '@/app/services/localDataService';
import type { FoodItem } from '@/types';
import { useFoodTrackingStore } from '@/features/food-tracking/model/foodTrackingStore';

export const useFoodSearch = () => {
  const searchResults = ref<FoodItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const searchCache = ref<Record<string, FoodItem[]>>({});
  const offlineMode = ref(!navigator.onLine);

  const foodTrackingStore = useFoodTrackingStore();

  const userLocale = computed(() => {
    return navigator.language.split('-')[0].toLowerCase() || 'ru';
  });

  onMounted(() => {
    loadCacheFromStorage();

    window.addEventListener('online', () => {
      offlineMode.value = false;
    });
    window.addEventListener('offline', () => {
      offlineMode.value = true;
    });
  });

  const loadCacheFromStorage = () => {
    const cached = localStorage.getItem('foodSearchCache');
    if (cached) {
      try {
        searchCache.value = JSON.parse(cached);
      } catch (e) {
        console.error('Ошибка загрузки кэша поиска:', e);
      }
    }
  };

  const saveCacheToStorage = () => {
    try {
      localStorage.setItem('foodSearchCache', JSON.stringify(searchCache.value));
    } catch (e) {
      console.warn('Не удалось сохранить кэш поиска', e);
    }
  };

  const transformApiData = (product: any): FoodItem => {
    const nutriments = product.nutriments || {};
    const energyPer100g =
      nutriments['energy-kcal_100g'] ||
      (nutriments['energy_100g'] ? Math.round(nutriments['energy_100g'] / 4.184) : 0);

    const name =
      product.product_name_ru || product.product_name || product.generic_name || 'Без названия';

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

  const isValidNutritionData = (product: any): boolean => {
    const nutriments = product.nutriments || {};
    return (
      !!(nutriments['energy-kcal_100g'] || nutriments['energy_100g']) &&
      (nutriments.proteins_100g || nutriments.fat_100g || nutriments.carbohydrates_100g)
    );
  };

  const sortProductsByRelevance = (products: any[], query: string): any[] => {
    const normalizedQuery = query.toLowerCase().trim();
    console.log(products);

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

  // Поиск с fallback на локальную базу
  const searchFoodsWithFallback = async (query: string) => {
    if (query.length < 2) {
      searchResults.value = [];
      return;
    }

    const normalizedQuery = query.trim().toLowerCase();
    const cacheKey = `${normalizedQuery}_${userLocale.value}`;

    if (searchCache.value[cacheKey]) {
      searchResults.value = searchCache.value[cacheKey];
      return;
    }

    loading.value = true;
    error.value = null;
    searchResults.value = [];

    try {
      // 1. Сначала ищем в локальной базе
      const localResults = searchLocalFoods(normalizedQuery);

      // 2. Добавляем кастомные продукты, отфильтрованные по запросу
      const customResults = foodTrackingStore.customFoods
        .filter((food) => food.name.toLowerCase().includes(normalizedQuery))
        .map((food) => ({
          ...food,
          id: food.id || crypto.randomUUID(),
          source: 'custom', // Отмечаем как кастомный продукт
        }));

      // 3. Объединяем результаты: сначала локальные, потом кастомные
      let combinedResults = [...localResults, ...customResults];

      // 4. Если нашли результаты, показываем их
      if (combinedResults.length > 0) {
        searchResults.value = [...combinedResults];
      }

      // 5. Если нет интернета или достаточно локальных+кастомных результатов - пропускаем API
      if (offlineMode.value || combinedResults.length >= 10) {
        if (searchResults.value.length === 0) {
          fallbackToLocalSearch(normalizedQuery);
        }
        return;
      }

      // 6. Запрашиваем API
      const apiResults = await searchApiFoods(normalizedQuery);

      const uniqueApiResults = apiResults.filter((apiItem) => {
        return !combinedResults.some((existingItem) => {
          const nameSimilarity = existingItem.name.toLowerCase() === apiItem.name.toLowerCase();

          const nutritionSimilarity =
            Math.abs(existingItem.protein - apiItem.protein) <= 0.1 &&
            Math.abs(existingItem.fat - apiItem.fat) <= 0.1 &&
            Math.abs(existingItem.carbs - apiItem.carbs) <= 0.1;

          return nameSimilarity && nutritionSimilarity;
        });
      });

      // 8. Добавляем уникальные результаты из API
      combinedResults = [...combinedResults, ...uniqueApiResults];

      searchResults.value = combinedResults.slice(0, 10);

      // 10. Кэшируем результаты
      if (searchResults.value.length > 0) {
        searchCache.value[cacheKey] = searchResults.value;
        saveCacheToStorage();
      }
    } catch (err) {
      console.warn('Ошибка при поиске, используем локальную базу:', err);
      fallbackToLocalSearch(normalizedQuery);
    } finally {
      loading.value = false;
    }
  };

  const searchApiFoods = async (query: string): Promise<FoodItem[]> => {
    try {
      const results = await searchFoods(query);

      const validProducts = results.filter(isValidNutritionData);
      if (validProducts.length === 0) return [];

      const sortedProducts = sortProductsByRelevance(validProducts, query);

      return sortedProducts.map(transformApiData);
    } catch (err) {
      console.error('Ошибка API Open Food Facts:', err);
      return [];
    }
  };

  const fallbackToLocalSearch = (query: string) => {
    const localResults = searchLocalFoods(query);

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

  return {
    searchResults,
    loading,
    error,
    offlineMode,
    userLocale,
    searchFoods: searchFoodsWithFallback,
    searchByBarcode,
  };
};
