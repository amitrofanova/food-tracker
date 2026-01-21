<script setup lang="ts">
import { useTrackingStore } from '@/stores/trackingStore';
import type { DailyEntry, MealType } from '@/types';

const store = useTrackingStore();

const mealTypes: { type: MealType; label: string }[] = [
  { type: 'breakfast', label: 'Завтрак' },
  { type: 'lunch', label: 'Обед' },
  { type: 'dinner', label: 'Ужин' },
  { type: 'snack', label: 'Перекусы' },
];

const getMealEntries = (mealType: MealType) =>
  store.currentDayEntries.filter((entry) => entry.mealType === mealType);

const totalMealCalories = (mealType: MealType) =>
  getMealEntries(mealType).reduce((sum, entry) => sum + entry.calories, 0);
</script>

<template>
  <div class="meals-container">
    <div v-for="meal in mealTypes" :key="meal.type" class="meal-section">
      <div class="meal-header">
        <h3>{{ meal.label }}</h3>
        <span class="meal-total">{{ totalMealCalories(meal.type) }} ккал</span>
      </div>

      <div v-if="getMealEntries(meal.type).length === 0" class="empty-meal">Нет записей</div>

      <div v-else class="entries-list">
        <div v-for="entry in getMealEntries(meal.type)" :key="entry.id" class="entry-item">
          <div class="entry-content">
            <div class="entry-name">{{ entry.name }}</div>
            <div class="entry-portion">{{ entry.portion }}г</div>
            <div class="entry-nutrition">
              <span>{{ entry.calories }} ккал</span>
              <span>Б:{{ entry.protein }}г</span>
              <span>Ж:{{ entry.fat }}г</span>
              <span>У:{{ entry.carbs }}г</span>
            </div>
          </div>
          <button @click="store.removeEntry(entry.id)" class="delete-btn">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meals-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.meal-section:not(:last-child) {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.meal-header h3 {
  margin: 0;
  color: #1a1a1a;
}

.meal-total {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 500;
}

.empty-meal {
  color: #6c757d;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.entry-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s;
}

.entry-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.entry-content {
  flex: 1;
}

.entry-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.entry-portion {
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.entry-nutrition {
  display: flex;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #495057;
}

.delete-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ffcdd2;
  color: #b71c1c;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #ef9a9a;
  transform: scale(1.1);
}
</style>
