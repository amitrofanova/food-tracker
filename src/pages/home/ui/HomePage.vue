<script setup lang="ts">
import { useBreakpoints } from '@/shared/lib/breakpoints';
import { MEAL_TYPES } from '@/shared/config/meals';
import { DateNavigation } from '@/widgets/date-navigation';
import { DailySummary } from '@/widgets/daily-summary';
import { MealBlock } from '@/widgets/meal-block';
import { AddDiaryEntry } from '@/widgets/add-diary-entry';

const { isDesktop } = useBreakpoints();
</script>

<template>
  <div class="wrapper">
    <AddDiaryEntry v-if="isDesktop" />
    <div>
      <DateNavigation />
      <DailySummary class="summary" />
      <MealBlock v-for="type in MEAL_TYPES" :key="type" :mealType="type" />
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  padding-bottom: 50px;
}
@media (min-width: 768px) {
  .wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
}
.summary {
  margin: 20px 0;
}
</style>
