<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDiaryStore } from '@/entities/diary-entry';
import EntryRow from '@/entities/diary-entry/ui/EntryRow.vue';
import AddToMealBtn from '@/features/add-to-diary/ui/AddToMealBtn.vue';
import { MEAL_LABELS, type MealType } from '@/shared/config/meals';

defineProps<{ mealType: MealType }>();

const diaryStore = useDiaryStore();

const { entriesByMeal, mealTotals } = storeToRefs(diaryStore);

const isMobile = computed(() => window.innerWidth < 768);
</script>

<template>
  <div class="wrap">
    <div class="header">
      <h3>{{ MEAL_LABELS[mealType] }}</h3>
      <span>{{ mealTotals[mealType] }} ккал</span>
    </div>
    <div>
      <EntryRow
        v-for="entry in entriesByMeal[mealType]"
        :key="entry.id"
        :entry="entry"
        @remove="diaryStore.removeEntry"
      />
      <div v-if="entriesByMeal[mealType].length === 0">Нет записей</div>
    </div>
    <AddToMealBtn v-if="isMobile" :mealType="mealType" />
  </div>
</template>

<style scoped>
.wrap {
  border: 1px solid #eee;
  padding: 12px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
