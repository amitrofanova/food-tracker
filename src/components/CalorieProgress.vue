<script setup lang="ts">
import { computed } from 'vue';
import { useFoodTrackingStore } from '@/app/stores/foodTrackingStore';
import { APP_CONFIG } from '@/app/config/config';

const store = useFoodTrackingStore();

const progressPercentage = computed(() =>
  Math.min(100, (store.dailyTotals.calories / APP_CONFIG.dailyCalorieGoal) * 100),
);

const getMacroPercentage = (value: number, goal: number) => Math.min(100, (value / goal) * 100);
</script>

<template>
  <div class="progress-container">
    <div class="progress-header">
      <span>Калории: {{ store.dailyTotals.calories }}/{{ APP_CONFIG.dailyCalorieGoal }} ккал</span>
      <span>{{ Math.round(progressPercentage) }}%</span>
    </div>
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: `${progressPercentage}%` }"
        :class="{ over: store.dailyTotals.calories > APP_CONFIG.dailyCalorieGoal }"
      ></div>
    </div>

    <div class="macros">
      <div class="macro-item">
        <span>Б: {{ store.dailyTotals.protein }}г</span>
        <div class="macro-bar">
          <div
            class="macro-fill protein"
            :style="{
              width: `${getMacroPercentage(store.dailyTotals.protein, APP_CONFIG.macroGoals.protein)}%`,
            }"
          ></div>
        </div>
      </div>
      <div class="macro-item">
        <span>Ж: {{ store.dailyTotals.fat }}г</span>
        <div class="macro-bar">
          <div
            class="macro-fill fat"
            :style="{
              width: `${getMacroPercentage(store.dailyTotals.fat, APP_CONFIG.macroGoals.fat)}%`,
            }"
          ></div>
        </div>
      </div>
      <div class="macro-item">
        <span>У: {{ store.dailyTotals.carbs }}г</span>
        <div class="macro-bar">
          <div
            class="macro-fill carbs"
            :style="{
              width: `${getMacroPercentage(store.dailyTotals.carbs, APP_CONFIG.macroGoals.carbs)}%`,
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #1a1a1a;
}

.progress-bar {
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-fill.over {
  background: linear-gradient(90deg, #f44336, #ff9800);
}

.macros {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.25rem;
}

.macro-item {
  text-align: center;
}

.macro-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  margin-top: 4px;
  overflow: hidden;
}

.macro-fill {
  height: 100%;
  border-radius: 3px;
}

.protein {
  background: #2196f3;
}
.fat {
  background: #ff9800;
}
.carbs {
  background: #ff5722;
}
</style>
