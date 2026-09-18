import { defineStore } from 'pinia';
import type { MealType } from '@/shared/config';
import {
  createLocalDiaryEntry,
  fromApiDiaryEntry,
  normalizeIndexedDbDiaryEntry,
  portionMacros,
  toEntryCreatePayload,
  type DiaryProductSnapshot,
  type IDiaryEntry,
} from './types';
import {
  fetchDiaryEntries,
  saveDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
} from '@/shared/api';
import { db } from '@/shared/db';
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
        // Server rows are snapshots: productName + per-100g macros, not a live Product join.
        entries.value = (await fetchDiaryEntries(date || selectedDate.value)).map(fromApiDiaryEntry);
      } else {
        const all = await db.getAllEntries();
        const normalized = all.map(normalizeIndexedDbDiaryEntry);
        const migrated = normalized.filter((entry, index) => entry !== all[index]);
        if (migrated.length > 0) {
          try {
            await Promise.all(migrated.map((entry) => db.saveEntry(entry)));
          } catch (err) {
            console.error('Failed to migrate diary macros to per-100g:', err);
          }
        }
        const target = date || selectedDate.value;
        entries.value = normalized.filter((e) => e.date === target);
      }
    } catch (err) {
      error.value = extractErrorMessage(err, 'Ошибка загрузки дневника');
      console.error('Failed to load entries:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function addEntry(product: DiaryProductSnapshot, weight: number, mealType: MealType) {
    const date = selectedDate.value;
    try {
      error.value = null;
      const localEntry = createLocalDiaryEntry(product, { date, weight, mealType });
      if (isAuthenticated()) {
        // Snapshot only: do not upsert a global Product by name for custom/recipe/offline food.
        await saveDiaryEntry(toEntryCreatePayload(localEntry));
        await loadEntries(date);
      } else {
        await db.saveEntry(localEntry);
        entries.value = [...entries.value, localEntry];
      }
    } catch (err) {
      error.value = extractErrorMessage(err, 'Ошибка сохранения записи');
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
        const updated: IDiaryEntry = {
          ...entry,
          mealType,
          weight,
        };
        await db.saveEntry(updated);
        entries.value = entries.value.map((e) => (e.id === id ? updated : e));
      }
    } catch (err) {
      error.value = extractErrorMessage(err, 'Ошибка обновления записи');
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
      error.value = extractErrorMessage(err, 'Ошибка удаления записи');
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
      const portion = portionMacros(entry);
      totals.calories += portion.calories;
      totals.proteins += portion.protein;
      totals.fats += portion.fat;
      totals.carbs += portion.carbs;
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
      if (entry.mealType) {
        totals[entry.mealType] += portionMacros(entry).calories;
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
