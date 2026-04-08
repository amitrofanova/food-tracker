import { defineStore } from 'pinia';
import { db } from '@/shared/db';
import type { MealType } from '@/shared/config/meals';
import type { IDiaryEntry } from './types';

export const useDiaryStore = defineStore('diary', () => {
  const entries = ref<IDiaryEntry[]>([]);
  const selectedDate = ref(new Date().toISOString().slice(0, 10));
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function loadEntries() {
    isLoading.value = true;
    error.value = null;
    try {
      // TODO load last week
      const allEntries = await db.getAllEntries();
      entries.value = allEntries;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load entries';
      console.error('Failed to load entries:', err);
    } finally {
      isLoading.value = false;
    }
  }

  loadEntries();

  async function saveEntry(entry: IDiaryEntry) {
    try {
      error.value = null;
      await db.saveEntry(entry);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save entry';
      console.error('Failed to save entry:', err);
      throw err;
    }
  }

  async function deleteEntry(id: string) {
    try {
      error.value = null;
      await db.deleteEntry(id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete entry';
      console.error('Failed to delete entry:', err);
      throw err;
    }
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
    try {
      error.value = null;
      const newEntry: IDiaryEntry = {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      };
      entries.value.push(newEntry);
      await saveEntry(newEntry);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add entry';
      console.error('Failed to add entry:', err);
      throw err;
    }
  }

  async function removeEntry(id: string) {
    try {
      error.value = null;
      const index = entries.value.findIndex((e) => e.id === id);
      if (index !== -1) {
        entries.value.splice(index, 1);
        await deleteEntry(id);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove entry';
      console.error('Failed to remove entry:', err);
      throw err;
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
    error,
    addEntry,
    removeEntry,
    setSelectedDate,
  };
});
