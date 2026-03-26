<script setup lang="ts">
import { computed } from 'vue';
import { useDiaryStore } from '@/entities/diary-entry';
import { storeToRefs } from 'pinia';
import { Icon } from '@/shared/ui/icon';

const diaryStore = useDiaryStore();
const { selectedDate } = storeToRefs(diaryStore);

const formattedDate = computed(() => {
  const [year, month, day] = selectedDate.value.split('-');
  return `${day}.${month}.${year}`;
});

const prevDay = () => {
  const date = new Date(selectedDate.value);
  date.setDate(date.getDate() - 1);
  diaryStore.setSelectedDate(date.toISOString().slice(0, 10));
};

const nextDay = () => {
  const date = new Date(selectedDate.value);
  date.setDate(date.getDate() + 1);
  diaryStore.setSelectedDate(date.toISOString().slice(0, 10));
};
</script>

<template>
  <div class="nav-wrap">
    <button @click="prevDay" class="nav-btn"><Icon name="ArrowLeft" /></button>
    <span>{{ formattedDate }}</span>
    <button @click="nextDay" class="nav-btn"><Icon name="ArrowRight" /></button>
  </div>
</template>

<style scoped>
.nav-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
  padding: 8px;
}
.nav-btn {
  appearance: none;
  outline: none;
  border: none;
  border-radius: var(--border-radius);
  padding: 4px 12px;
  cursor: pointer;
}
</style>
