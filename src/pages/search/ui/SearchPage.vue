<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { MealType } from '@/shared/config/meals';
import { useDiaryStore } from '@/entities/diary-entry';
import { AddDiaryEntry } from '@/widgets/add-diary-entry';

defineProps<{ mealType: MealType }>();
const router = useRouter();

const goBack = () => {
  router.back();
};

const dairyStore = useDiaryStore();
</script>

<template>
  <div class="wrapper">
    <div class="header">
      <button @click="goBack" class="btn-back"></button>
      <div class="info">
        <span class="meal">{{ mealType }}</span>
        <span class="date">{{ dairyStore.selectedDate }}</span>
      </div>
    </div>
    <AddDiaryEntry :mealType="mealType" />
  </div>
</template>

<style scoped>
.wrapper {
  padding: 1rem;
}
.header {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
}
.btn-back {
  position: relative;
  appearance: none;
  border: none;
  background-color: transparent;
}
.btn-back::before {
  display: block;
  width: 24px;
  height: 24px;
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg data-name='Layer 2'%3E%3Cpath d='M13.83 19a1 1 0 0 1-.78-.37l-4.83-6a1 1 0 0 1 0-1.27l5-6a1 1 0 0 1 1.54 1.28L10.29 12l4.32 5.36a1 1 0 0 1-.78 1.64' data-name='arrow-ios-back'/%3E%3C/g%3E%3C/svg%3E");
}
.info {
  display: grid;
  gap: 6px;
  direction: rtl;
  line-height: 100%;
}
.meal {
  text-transform: capitalize;
  font-size: 24px;
}
.date {
  font-size: 14px;
}
</style>
