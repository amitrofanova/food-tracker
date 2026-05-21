<script setup lang="ts">
import type { MealType } from '@/shared/config/meals';
import { useDiaryStore } from '@/entities/diary-entry';
import { AddDiaryEntry } from '@/widgets/add-diary-entry';
import { PageHeader } from '@/shared/ui/page-header';

defineProps<{ mealType: MealType }>();

const diaryStore = useDiaryStore();
</script>

<template>
  <div class="wrapper">
    <PageHeader>
      <div class="info">
        <span class="meal">{{ mealType }}</span>
        <span class="date">{{ diaryStore.selectedDate }}</span>
      </div>
    </PageHeader>
    <AddDiaryEntry :mealType="mealType" />
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height) - var(--padding));
  overflow: hidden;
}
@media (max-width: 767px) {
  .wrapper {
    height: calc(100vh - var(--header-height) - calc(var(--padding-mobile) * 3));
  }
}
/* AddDiaryEntry uses a self-contained calc() height designed for the home page.
   Here it must fill the remaining flex space after the back-button header. */
:deep(.add-entry-wrap) {
  flex: 1 !important;
  height: auto !important;
  min-height: 0;
}
.info {
  display: flex;
  flex-direction: column;
  direction: rtl;
  line-height: normal;
}
.meal {
  text-transform: capitalize;
  font-size: 24px;
}
.date {
  font-size: 14px;
}
</style>
