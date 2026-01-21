import { defineStore } from 'pinia';
import type { FoodItem, DailyEntry, MealType } from '@/shared/types';

export const useFoodTrackingStore = defineStore('foodTracking', () => {
  const dailyEntries = ref<Record<string, DailyEntry[]>>({});
  const customFoods = ref<FoodItem[]>([]);

  const today = computed(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  const currentDayEntries = computed(() => dailyEntries.value[today.value] || []);

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

    if (!dailyEntries.value[today.value]) {
      dailyEntries.value[today.value] = [];
    }
    dailyEntries.value[today.value].push(entry);
    saveToLocalStorage();
  };

  const removeEntry = (entryId: string) => {
    dailyEntries.value[today.value] = currentDayEntries.value.filter(
      (entry) => entry.id !== entryId,
    );
    saveToLocalStorage();
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
    const savedEntries = localStorage.getItem('dailyEntries');
    const savedCustomFoods = localStorage.getItem('customFoods');

    if (savedEntries) dailyEntries.value = JSON.parse(savedEntries);
    if (savedCustomFoods) customFoods.value = JSON.parse(savedCustomFoods);
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('dailyEntries', JSON.stringify(dailyEntries.value));
    localStorage.setItem('customFoods', JSON.stringify(customFoods.value));
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
