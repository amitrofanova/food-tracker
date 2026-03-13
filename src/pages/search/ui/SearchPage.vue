<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { MealType } from '@/shared/config/meals';
import { AddDiaryEntry } from '@/widgets/add-diary-entry';

defineProps<{ mealType: MealType }>();
const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="search-page">
    <button @click="goBack" class="back-button">Назад</button>
    <AddDiaryEntry :mealType="mealType" />
  </div>
</template>
