<script setup lang="ts">
import { useDiaryStore } from '@/entities/diary-entry';
import { storeToRefs } from 'pinia';

const diaryStore = useDiaryStore();
const { dailyTotals } = storeToRefs(diaryStore);
</script>

<template>
  <div class="daily-summary">
    <div class="totals">
      <div class="total-item">
        <span class="label">Калории</span>
        <span class="value">{{ dailyTotals.calories }} ккал</span>
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
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
}
.totals {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-around;
}
.total-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.label {
  font-size: 0.9em;
  color: #666;
}
.value {
  font-size: 1.5em;
  font-weight: bold;
}
</style>
