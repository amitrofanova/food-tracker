import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IDiaryEntry } from './types';

export const useDiaryStore = defineStore('diary', () => {
  const entries = ref<IDiaryEntry[]>([]);
  const selectedDate = ref(new Date().toISOString().slice(0, 10));

  const dailyEntries = computed(() => entries.value.filter((e) => e.date === selectedDate.value));

  const dailyTotals = computed(() => {
    const totals = { calories: 0, protein: 0, fat: 0, carbs: 0 };
    dailyEntries.value.forEach((e) => {
      totals.calories += e.calories;
      totals.protein += e.protein;
      totals.fat += e.fat;
      totals.carbs += e.carbs;
    });
    return totals;
  });

  function addEntry(entry: Omit<IDiaryEntry, 'id'>) {
    const newEntry: IDiaryEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    };
    entries.value.push(newEntry);
  }

  function removeEntry(id: string) {
    const index = entries.value.findIndex((e) => e.id === id);
    if (index !== -1) entries.value.splice(index, 1);
  }

  function setSelectedDate(date: string) {
    selectedDate.value = date;
  }

  return {
    entries,
    selectedDate,
    dailyEntries,
    dailyTotals,
    addEntry,
    removeEntry,
    setSelectedDate,
  };
});
