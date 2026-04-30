import { defineStore } from 'pinia';
import type { MealType } from '@/shared/config/meals';
import type { IDiaryEntry } from './types';
import { fetchDiaryEntries, saveDiaryEntry, deleteDiaryEntry } from '@/shared/api/diary';
import { db } from '@/shared/db';

const isAuthenticated = () => !!localStorage.getItem('token');

export const useDiaryStore = defineStore('diary', () => {
  const entries = ref<IDiaryEntry[]>([]);
  const selectedDate = ref(new Date().toISOString().slice(0, 10));
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function loadEntries(date?: string) {
    isLoading.value = true;
    error.value = null;
    try {
      if (isAuthenticated()) {
        entries.value = await fetchDiaryEntries(date || selectedDate.value);
      } else {
        const all = await db.getAllEntries();
        const target = date || selectedDate.value;
        entries.value = all.filter((e) => e.date === target);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load entries';
      console.error('Failed to load entries:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function addEntry(entry: Omit<IDiaryEntry, 'id'>) {
    try {
      error.value = null;
      if (isAuthenticated()) {
        await saveDiaryEntry(entry);
        await loadEntries(entry.date);
      } else {
        const localEntry: IDiaryEntry = { ...entry, id: crypto.randomUUID() };
        await db.saveEntry(localEntry);
        entries.value = [...entries.value, localEntry];
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save entry';
      console.error('Failed to save entry:', err);
      throw err;
    }
  }

  async function removeEntry(id: string) {
    try {
      error.value = null;
      if (isAuthenticated()) {
        await deleteDiaryEntry(id);
        await loadEntries();
      } else {
        await db.deleteEntry(id);
        entries.value = entries.value.filter((e) => e.id !== id);
      }
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
      map[entry.mealType]?.push(entry);
    });
    return map;
  });

  const dailyTotals = computed(() => {
    const totals = {
      calories: 0,
      proteins: 0,
      fats: 0,
      carbs: 0,
    };
    dailyEntries.value.forEach((entry) => {
      totals.calories += entry.calories || 0;
      totals.proteins += entry.protein || 0;
      totals.fats += entry.fat || 0;
      totals.carbs += entry.carbs || 0;
    });
    return totals;
  });

  const mealTotals = computed(() => {
    const totals: Record<MealType, number> = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0,
    };
    dailyEntries.value.forEach((entry) => {
      if (entry.mealType && typeof entry.calories === 'number') {
        totals[entry.mealType] += entry.calories;
      }
    });
    return totals;
  });

  function clearEntries() {
    entries.value = [];
  }

  return {
    entries,
    selectedDate,
    isLoading,
    error,
    loadEntries,
    addEntry,
    removeEntry,
    clearEntries,
    setSelectedDate(date: string) {
      selectedDate.value = date;
      loadEntries(date);
    },
    dailyEntries,
    entriesByMeal,
    dailyTotals,
    mealTotals,
  };
});
