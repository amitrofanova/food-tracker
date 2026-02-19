<script setup lang="ts">
import { computed, ref } from 'vue';
import { useProductSearch } from '../lib/useProductSearch';
import ProductCard from '@/entities/product/ui/ProductCard.vue';
import AddToDiaryForm from '@/features/add-to-diary/ui/AddToDiaryForm.vue';
import { MEAL_TYPES, MEAL_LABELS, type MealType } from '@/shared/config/meals';

defineProps<{ mealType?: MealType }>();

const { searchQuery, results, loading, error, hasMore, loadMore } = useProductSearch();

const isMobile = computed(() => window.innerWidth < 768);

const selectedMeal = ref<MealType>('breakfast');
</script>

<template>
  <div class="product-search">
    <input v-model="searchQuery" class="search-input" />
    <select v-if="!isMobile" v-model="selectedMeal" class="meal-select">
      <option v-for="type in MEAL_TYPES" :key="type" :value="type">
        {{ MEAL_LABELS[type] }}
      </option>
    </select>

    <div class="results">
      <div v-for="product in results" :key="product.id" class="result-item">
        <ProductCard :product="product" />
        <AddToDiaryForm :product="product" :mealType="selectedMeal" />
      </div>
    </div>
    <div v-if="loading" class="status">Загрузка...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else-if="results.length === 0 && searchQuery" class="status">Ничего не найдено</div>

    <button v-if="results.length && hasMore && !loading" @click="loadMore" class="load-more">
      Загрузить ещё
    </button>
  </div>
</template>

<style scoped>
.product-search {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
.search-input {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}
.status {
  text-align: center;
  padding: 20px;
}
.results {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.result-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}
.result-item > :first-child {
  flex: 1;
}
.diary-preview {
  margin-top: 40px;
  padding-top: 20px;
}
</style>
