<script setup lang="ts">
import { useDiaryStore } from '@/entities/diary-entry';
import { storeToRefs } from 'pinia';
import { Icon } from '@/shared/ui/icon';
import { AppButton } from '@/shared/ui/button';

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
    <AppButton @click="prevDay"><Icon name="ArrowLeft" /></AppButton>
    <span>{{ formattedDate }}</span>
    <AppButton @click="nextDay"><Icon name="ArrowRight" /></AppButton>
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
</style>
