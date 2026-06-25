import { defineStore } from 'pinia';
import type { MealType } from '@/shared/config/meals';
import type { IDiaryEntry } from './types';
import {
  fetchDiaryEntries,
  saveDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
} from '@/shared/api/diary';
import { db } from '@/shared/db';
import type { IProduct } from '@/entities/product';
import { isAuthenticated } from '@/shared/lib/auth';
import { extractErrorMessage } from '@/shared/lib/error';

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
      error.value = extractErrorMessage(err, 'Failed to load entries');
      console.error('Failed to load entries:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function addEntry(product: IProduct, weight: number, mealType: MealType) {
    const date = selectedDate.value;
    try {
      error.value = null;
      if (isAuthenticated()) {
        await saveDiaryEntry({
          date,
          productId: product.id,
          productName: product.name,
          mealType,
          weight,
          calories: product.calories,
          protein: product.protein,
          fat: product.fat,
          carbs: product.carbs,
        });
        await loadEntries(date);
      } else {
        const factor = weight / 100;
        const localEntry: IDiaryEntry = {
          id: crypto.randomUUID(),
          date,
          productId: product.id,
          productName: product.name,
          mealType,
          weight,
          calories: Math.round(product.calories * factor),
          protein: Math.round(product.protein * factor),
          fat: Math.round(product.fat * factor),
          carbs: Math.round(product.carbs * factor),
        };
        await db.saveEntry(localEntry);
        entries.value = [...entries.value, localEntry];
      }
    } catch (err) {
      error.value = extractErrorMessage(err, 'Failed to save entry');
      console.error('Failed to save entry:', err);
      throw err;
    }
  }

  async function updateEntry(id: string, weight: number, mealType: MealType) {
    try {
      error.value = null;
      if (isAuthenticated()) {
        await updateDiaryEntry(id, { weight, mealType });
        await loadEntries();
      } else {
        const entry = entries.value.find((e) => e.id === id);
        if (!entry) return;
        // Scale macros proportionally to the new weight
        const factor = weight / entry.weight;
        const updated: IDiaryEntry = {
          ...entry,
          mealType,
          weight,
          calories: Math.round(entry.calories * factor),
          protein: Math.round(entry.protein * factor),
          fat: Math.round(entry.fat * factor),
          carbs: Math.round(entry.carbs * factor),
        };
        await db.saveEntry(updated);
        entries.value = entries.value.map((e) => (e.id === id ? updated : e));
      }
    } catch (err) {
      error.value = extractErrorMessage(err, 'Failed to update entry');
      console.error('Failed to update entry:', err);
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
      error.value = extractErrorMessage(err, 'Failed to delete entry');
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
    return {
      calories: Math.round(totals.calories),
      proteins: Math.round(totals.proteins),
      fats: Math.round(totals.fats),
      carbs: Math.round(totals.carbs),
    };
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
    return Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, Math.round(v)])) as Record<
      MealType,
      number
    >;
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
    updateEntry,
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
