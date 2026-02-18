<template>
  <div class="meal-block">
    <div class="meal-header">
      <h3>{{ MEAL_LABELS[mealType] }}</h3>
      <span class="meal-calories">{{ mealTotals[mealType] }} ккал</span>
    </div>

    <div class="entries">
      <EntryRow
        v-for="entry in entriesByMeal[mealType]"
        :key="entry.id"
        :entry="entry"
        @remove="diaryStore.removeEntry"
      />
      <div v-if="entriesByMeal[mealType].length === 0" class="empty">Нет записей</div>
    </div>

    <AddToMealBtn v-if="isMobile" :mealType="mealType" class="mobile-add" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDiaryStore } from '@/entities/diary-entry';
import EntryRow from '@/entities/diary-entry/ui/EntryRow.vue';
import { MEAL_LABELS, type MealType } from '@/shared/config/meals';
import AddToMealBtn from '@/features/add-to-diary/ui/AddToMealBtn.vue';

defineProps<{ mealType: MealType }>();

const diaryStore = useDiaryStore();
const { entriesByMeal, mealTotals } = storeToRefs(diaryStore);

const isMobile = computed(() => window.innerWidth < 768);
</script>

<style scoped>
.meal-block {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}
.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.meal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}
.meal-calories {
  font-weight: bold;
  color: #4caf50;
}
.entries {
  margin-bottom: 8px;
}
.empty {
  color: #999;
  font-style: italic;
  padding: 8px 0;
}
.mobile-add {
  display: block;
  margin-top: 8px;
}
@media (min-width: 768px) {
  .mobile-add {
    display: none;
  }
}
</style>
