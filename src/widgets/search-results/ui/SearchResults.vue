<template>
  <div class="search-results">
    <select v-if="!isMobile" v-model="selectedMeal" class="meal-select">
      <option v-for="type in MEAL_TYPES" :key="type" :value="type">
        {{ MEAL_LABELS[type] }}
      </option>
    </select>
    <ProductSearch @update:results="handleResults" />

    <!-- Результаты с формой добавления -->
    <div v-if="products.length" class="results-list">
      <div v-for="product in products" :key="product.id" class="result-item">
        <ProductCard :product="product" />
        <AddToDiaryForm :product="product" :mealType="isMobile ? mealType : selectedMeal" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ProductSearch from '@/features/product-search/ui/ProductSearch.vue';
import AddToDiaryForm from '@/features/add-to-diary/ui/AddToDiaryForm.vue';
import ProductCard from '@/entities/product/ui/ProductCard.vue';
import type { IProduct } from '@/entities/product';
import { MEAL_TYPES, MEAL_LABELS, type MealType } from '@/shared/config/meals';

withDefaults(defineProps<{ mealType?: MealType }>(), { mealType: 'breakfast' });

const selectedMeal = ref<MealType>('breakfast');

const products = ref<IProduct[]>([]);

const isMobile = computed(() => window.innerWidth < 768);

const handleResults = (newResults: IProduct[]) => {
  products.value = newResults;
};
</script>

<style scoped>
.result-item {
  display: flex;
}
</style>
