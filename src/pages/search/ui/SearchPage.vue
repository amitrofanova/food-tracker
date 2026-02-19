<template>
  <div class="search-page">
    <button @click="goBack" class="back-button">← Назад</button>
    <SearchResults :mealType="mealType" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { MealType } from '@/shared/config/meals';
import SearchResults from '@/widgets/search-results/ui/SearchResults.vue';

defineProps<{ mealType: MealType }>();
const router = useRouter();

const goBack = () => {
  router.back();
};
</script>
