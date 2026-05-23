<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useDiaryStore } from '@/entities/diary-entry';
import { EntryRow } from '@/entities/diary-entry';
import { MEAL_LABELS, type MealType } from '@/shared/config/meals';
import { useBreakpoints } from '@/shared/lib/breakpoints';
import { ButtonIcon } from '@/shared/ui/button';

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
      <ButtonIcon
        v-if="isMobile"
        name="PlusSymbol"
        size="sm"
        color="rgb(var(--color-darkgreen))"
        class="btn-add"
        @click="goToSearch"
      />
    </div>
    <div>
      <EntryRow
        v-for="entry in entriesByMeal[mealType]"
        :key="entry.id"
        :entry="entry"
        @remove="diaryStore.removeEntry"
        @update="({ id, weight, mealType: m }) => diaryStore.updateEntry(id, weight, m)"
      />
      <div v-if="entriesByMeal[mealType].length === 0">Нет записей</div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  padding: 12px 0 30px;
}
@media (min-width: 768px) {
  .wrap {
    border-bottom: 1px solid #eee;
  }
}
.wrap:last-child {
  margin-bottom: 50px;
  border-bottom: none;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
}
.btn-add {
  border-radius: 20%;
  box-shadow: 0 2px 4px gray;
  appearance: none;
  width: 30px;
  height: 30px;
  bottom: 10px;
  background-color: white;
}
</style>
