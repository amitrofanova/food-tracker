<script setup lang="ts">
import { ref } from 'vue';
import type { MealType } from '@/shared/config/meals';
import { useProductSearch } from '../lib/useProductSearch';

const { searchQuery, results, loading, error, hasMore, loadMore } = useProductSearch();

defineProps<{ mealType: MealType }>();

const emit = defineEmits(['addEntry']);

const weights = ref<Record<string, number>>({});
</script>

<template>
  <div>
    <input v-model="searchQuery" type="search" placeholder="Искать продукт" class="input-search" />
    <div v-if="results.length" class="results">
      <div v-for="product in results" :key="product.id" class="result-item">
        <div class="item-header">
          <span>{{ product.name }}</span>
        </div>
        <div class="item-info">
          <div class="macros">
            <span>{{ product.calories }} ккал</span>
            <span>Б: {{ product.protein }}</span>
            <span>Ж: {{ product.fat }}</span>
            <span>У: {{ product.carbs }}</span>
          </div>
          <div class="item-controls">
            <input
              type="number"
              name="weight"
              v-model.number="weights[product.id]"
              placeholder="Вес (г)"
              min="1"
              class="input-weight"
            />
            <button
              :disabled="!weights[product.id]"
              class="button-add"
              @click="emit('addEntry', product, weights[product.id], mealType)"
            >
              +
            </button>
          </div>
        </div>
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
.input-search {
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
  padding: 8px;
  border-radius: 8px;
  background-color: rgb(232, 236, 247);
}
.item-info,
.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.item-header {
  font-weight: 700;
}
.macros {
  display: flex;
  gap: 10px;
}
.item-controls {
  border: 1px solid rgb(var(--color-secondary, 0.7));
  border-radius: 4px;
}
.input-weight {
  appearance: none;
  width: 80px;
  border: none;
  border-radius: 4px 0 0 4px;
  outline: none;
}
.button-add {
  appearance: none;
  border: 0;
  background-color: rgb(var(--color-secondary));
  border-radius: 0 2px 2px 0;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
}
.button-add:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
