<script setup lang="ts">
import { useDiaryStore } from '@/entities/diary-entry';
import { useUserStore } from '@/entities/user/';
import { AppProgress } from '@/shared/ui/progress';
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
        <AppProgress :value="dailyTotals.calories" :max="dailyGoal" />
      </div>
      <div class="total-item">
        <span class="label">Белки</span>
        <span class="value">{{ dailyTotals.proteins }} г</span>
      </div>
      <div class="total-item">
        <span class="label">Жиры</span>
        <span class="value">{{ dailyTotals.fats }} г</span>
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
  border-radius: var(--border-radius);
  color: rgb(var(--text-primary));
  box-shadow: 0 2px 4px rgb(var(--color-gray));
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
@media (max-width: 767px) {
  .total-item:first-of-type {
    flex: 1 1 100%;
  }
}
.label {
  font-weight: 700;
}
</style>
