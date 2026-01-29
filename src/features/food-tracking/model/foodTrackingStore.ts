import { defineStore } from 'pinia';
import { ref, computed, onMounted } from 'vue';
import type { FoodItem, DailyEntry, MealType } from '@/types';
import { useDateStore } from '@/features/date-navigation/model/date.store';

export const useFoodTrackingStore = defineStore('foodTracking', () => {
  const dateStore = useDateStore();
  const dailyEntries = ref<Record<string, DailyEntry[]>>({});
  const customFoods = ref<FoodItem[]>([]);

  const currentDayEntries = computed(() => dailyEntries.value[dateStore.currentDate] || []);

  const dailyTotals = computed(() => {
    return currentDayEntries.value.reduce(
      (totals, entry) => {
        totals.calories += Math.round((entry.calories * entry.portion) / 100);
        totals.protein += Math.round((entry.protein * entry.portion) / 100);
        totals.fat += Math.round((entry.fat * entry.portion) / 100);
        totals.carbs += Math.round((entry.carbs * entry.portion) / 100);
        return totals;
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 },
    );
  });

  const addFoodEntry = (food: FoodItem, portion: number, mealType: MealType) => {
    const entry: DailyEntry = {
      ...food,
      id: crypto.randomUUID(),
      portion,
      mealType,
      timestamp: new Date(),
    };

    if (!dailyEntries.value[dateStore.currentDate]) {
      dailyEntries.value[dateStore.currentDate] = [];
    }
    dailyEntries.value[dateStore.currentDate].push(entry);
    saveToLocalStorage();
  };

  const removeEntry = (entryId: string) => {
    if (dailyEntries.value[dateStore.currentDate]) {
      dailyEntries.value[dateStore.currentDate] = dailyEntries.value[dateStore.currentDate].filter(
        (entry) => entry.id !== entryId,
      );
      saveToLocalStorage();
    }
  };

  const addCustomFood = (food: Omit<FoodItem, 'id'>) => {
    const newFood = {
      ...food,
      id: crypto.randomUUID(),
      source: 'local',
    };
    customFoods.value.push(newFood);
    saveToLocalStorage();
    return newFood;
  };

  const loadFromLocalStorage = () => {
    try {
      const savedEntries = localStorage.getItem('dailyEntries');
      const savedCustomFoods = localStorage.getItem('customFoods');

      if (savedEntries) {
        const parsedEntries = JSON.parse(savedEntries);
        const validEntries: Record<string, DailyEntry[]> = {};
        Object.keys(parsedEntries).forEach((dateString) => {
          // if (isValidDate(dateString)) {
          validEntries[dateString] = parsedEntries[dateString];
          // }
        });
        dailyEntries.value = validEntries;
      }

      if (savedCustomFoods) customFoods.value = JSON.parse(savedCustomFoods);
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      dailyEntries.value = {};
      customFoods.value = [];
    }
  };

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('dailyEntries', JSON.stringify(dailyEntries.value));
      localStorage.setItem('customFoods', JSON.stringify(customFoods.value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  onMounted(() => {
    loadFromLocalStorage();
  });

  return {
    currentDayEntries,
    dailyTotals,
    customFoods,
    addFoodEntry,
    removeEntry,
    addCustomFood,
  };
});
