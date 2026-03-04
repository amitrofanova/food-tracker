import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IDiaryEntry } from './types';
import { diaryDb } from '@/shared/db/diaryDb';
import type { MealType } from '@/shared/config/meals';

export const useDiaryStore = defineStore('diary', () => {
  const entries = ref<IDiaryEntry[]>([]);
  const selectedDate = ref(new Date().toISOString().slice(0, 10));
  const isLoading = ref(false);

  async function loadEntries() {
    isLoading.value = true;
    try {
      // TODO load last week
      const allEntries = await diaryDb.entries.toArray();
      entries.value = allEntries;
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      isLoading.value = false;
    }
  }

  loadEntries();

  async function saveEntry(entry: IDiaryEntry) {
    await diaryDb.entries.put(entry);
  }

  async function deleteEntry(id: string) {
    await diaryDb.entries.delete(id);
  }

  const dailyEntries = computed(() => entries.value.filter((e) => e.date === selectedDate.value));

  const entriesByMeal = computed(() => {
    const map: Record<MealType, IDiaryEntry[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };
    dailyEntries.value.forEach((entry) => {
      map[entry.mealType].push(entry);
    });
    return map;
  });

  const mealTotals = computed(() => {
    const totals: Record<MealType, number> = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0,
    };
    dailyEntries.value.forEach((entry) => {
      totals[entry.mealType] += entry.calories;
    });
    return totals;
  });

  const dailyTotals = computed(() => {
    const totals = { calories: 0, proteins: 0, fats: 0, carbs: 0 };
    dailyEntries.value.forEach((e) => {
      totals.calories += e.calories;
      totals.proteins += e.protein;
      totals.fats += e.fat;
      totals.carbs += e.carbs;
    });
    return totals;
  });

  async function addEntry(entry: Omit<IDiaryEntry, 'id'>) {
    const newEntry: IDiaryEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    };
    entries.value.push(newEntry);
    await saveEntry(newEntry);
  }

  async function removeEntry(id: string) {
    const index = entries.value.findIndex((e) => e.id === id);
    if (index !== -1) {
      entries.value.splice(index, 1);
      await deleteEntry(id);
    }
  }

  function setSelectedDate(date: string) {
    selectedDate.value = date;
  }

  return {
    entries,
    selectedDate,
    dailyEntries,
    entriesByMeal,
    mealTotals,
    dailyTotals,
    isLoading,
    addEntry,
    removeEntry,
    setSelectedDate,
  };
});
