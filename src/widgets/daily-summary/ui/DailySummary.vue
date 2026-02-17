<script setup lang="ts">
import { useDiaryStore } from '@/entities/diary-entry';
import { storeToRefs } from 'pinia';

const diaryStore = useDiaryStore();
const { dailyTotals } = storeToRefs(diaryStore);
const dailyGoal = 2000;
</script>

<template>
  <div class="daily-summary">
    <div class="totals">
      <div class="total-item">
        <span class="label">Калории</span>
        <span class="value">{{ dailyTotals.calories }} / {{ dailyGoal }} ккал</span>
        <progress :value="dailyTotals.calories" :max="dailyGoal"></progress>
      </div>
      <div class="total-item">
        <span class="label">Белки</span>
        <span class="value">{{ dailyTotals.protein }} г</span>
      </div>
      <div class="total-item">
        <span class="label">Жиры</span>
        <span class="value">{{ dailyTotals.fat }} г</span>
      </div>
      <div class="total-item">
        <span class="label">Углеводы</span>
        <span class="value">{{ dailyTotals.carbs }} г</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.daily-summary {
  padding: 16px;
  background: #eee;
  border-radius: 8px;
  margin-bottom: 20px;
}
.totals {
  display: flex;
  gap: 16px;
  justify-content: space-around;
}
.total-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
