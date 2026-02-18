<template>
  <div class="search-page">
    <button @click="goBack" class="back-button">← Назад</button>
    <ProductSearch :initialMealType="mealType" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import ProductSearch from '@/features/product-search/ui/ProductSearch.vue';
import type { MealType } from '@/shared/config/meals';

defineProps<{ mealType: MealType }>();
const router = useRouter();

const goBack = () => {
  router.back();
};
</script>
