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
    <DateNavigation />
    <DailySummary />
    <div class="meals-container">
      <MealBlock v-for="type in MEAL_TYPES" :key="type" :mealType="type" />
    </div>
    <AddDiaryEntry v-if="isDesktop" />
  </div>
</template>

<style scoped>
.diary-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 767px) {
  .diary-page {
    padding: 10px;
  }
}

@media (min-width: 768px) {
  .diary-page {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .meals-container {
    grid-column: 1;
  }
  .desktop-search {
    grid-column: 2;
    position: sticky;
    top: 20px;
    height: fit-content;
  }
}
</style>
