<script setup lang="ts">
import { useProductSearch } from '../lib/useProductSearch';
import type { MealType } from '@/shared/config/meals';

defineProps<{ mealType: MealType; weight: number }>();

const { searchQuery, results, loading, error, hasMore, loadMore } = useProductSearch();

const emit = defineEmits(['addEntry']);
</script>

<template>
  <div class="product-search">
    <input v-model="searchQuery" placeholder="Искать продукт" class="search-input" />
    <div v-if="results.length" class="results">
      <div v-for="product in results" :key="product.id" class="result-item">
        {{ product.name }}
        <button
          @click="emit('addEntry', product, weight, mealType)"
          :disabled="!weight"
          class="add-btn"
        >
          +
        </button>
      </div>
    </div>
    <div v-if="loading" class="status">Loading</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else-if="results.length === 0 && searchQuery" class="status">No results</div>
    <button v-if="results.length && hasMore && !loading" @click="loadMore" class="load-more">
      Load more
    </button>
  </div>
</template>

<style scoped>
.product-search {
  max-width: 600px;
  margin: 10px auto;
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
  justify-content: space-between;
  padding: 8px 0;
}
</style>
