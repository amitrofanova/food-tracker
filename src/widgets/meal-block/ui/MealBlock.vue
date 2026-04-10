<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useDiaryStore } from '@/entities/diary-entry';
import { EntryRow } from '@/entities/diary-entry';
import { MEAL_LABELS, type MealType } from '@/shared/config/meals';
import { useBreakpoints } from '@/shared/lib/breakpoints';
import { AppButton } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

const { isMobile } = useBreakpoints();

const props = defineProps<{ mealType: MealType }>();

const diaryStore = useDiaryStore();

const { entriesByMeal, mealTotals } = storeToRefs(diaryStore);

const router = useRouter();
const goToSearch = () => {
  router.push(`/search/${props.mealType}`);
};
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
    <AppButton
      v-if="isMobile"
      size="sm"
      color="rgb(var(--color-primary))"
      class="btn-add"
      @click="goToSearch"
    >
      <Icon name="PlusSymbol" size="sm" />
    </AppButton>
  </div>
</template>

<style scoped>
.wrap {
  border: 1px solid #eee;
  border-bottom: 0;
  padding: 12px;
}
.wrap:last-child {
  border-bottom: 1px solid #eee;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.btn-add {
  margin-top: 0.5rem;
  margin-left: auto;
}
</style>
