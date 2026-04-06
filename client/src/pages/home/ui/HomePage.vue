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
  <div class="diary-page">
    <AddDiaryEntry v-if="isDesktop" />
    <div>
      <DateNavigation />
      <DailySummary class="summary" />
      <MealBlock v-for="type in MEAL_TYPES" :key="type" :mealType="type" />
    </div>
  </div>
</template>

<style scoped>
.diary-page {
  padding: var(--padding-mobile) var(--padding-mobile) 0;
}
@media (min-width: 768px) {
  .diary-page {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    padding: var(--padding) var(--padding) 0;
  }
}
.summary {
  margin: 20px 0;
}
</style>
