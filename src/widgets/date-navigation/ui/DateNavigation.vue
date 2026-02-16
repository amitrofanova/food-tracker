<script setup lang="ts">
import { computed } from 'vue';
import { useDiaryStore } from '@/entities/diary-entry';
import { storeToRefs } from 'pinia';

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
  <div class="date-navigation">
    <button @click="prevDay" class="nav-btn">←</button>
    <span class="current-date">{{ formattedDate }}</span>
    <button @click="nextDay" class="nav-btn">→</button>
  </div>
</template>

<style scoped>
.date-navigation {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
  padding: 8px;
  margin-bottom: 20px;
}
.nav-btn {
  background: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 1.2em;
  cursor: pointer;
}
.nav-btn:hover {
  background: #eee;
}
.current-date {
  font-weight: bold;
  min-width: 120px;
  text-align: center;
}
</style>
