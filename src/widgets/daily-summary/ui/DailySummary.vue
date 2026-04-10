<script setup lang="ts">
import { useDiaryStore } from '@/entities/diary-entry';
import { useUserStore } from '@/entities/user/';
import { storeToRefs } from 'pinia';

const diaryStore = useDiaryStore();
const { dailyTotals } = storeToRefs(diaryStore);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const dailyGoal = computed(() => user.value?.calorieBudget ?? 0);
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
        <span class="value">{{ Math.round(dailyTotals.proteins) }} г</span>
      </div>
      <div class="total-item">
        <span class="label">Жиры</span>
        <span class="value">{{ Math.round(dailyTotals.fats) }} г</span>
      </div>
      <div class="total-item">
        <span class="label">Углеводы</span>
        <span class="value">{{ Math.round(dailyTotals.carbs) }} г</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.daily-summary {
  padding: 16px;
  background-color: rgb(var(--color-primary));
  border-radius: var(--border-radius);
  color: white;
}
.totals {
  display: flex;
  gap: 16px;
  justify-content: space-around;
  flex-wrap: wrap;
}
.total-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.total-item:first-of-type {
  flex: 1 1 100%;
}
.label {
  font-weight: 700;
}
</style>
