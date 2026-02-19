<script setup lang="ts">
import { watch } from 'vue';
import type { IProduct } from '@/entities/product';
import { useProductSearch } from '../lib/useProductSearch';

const { searchQuery, results, loading, error, hasMore, loadMore } = useProductSearch();

const emit = defineEmits<{
  (e: 'update:results', results: IProduct[]): void;
}>();

watch(
  results,
  (newResults) => {
    console.log('newResults got');

    emit('update:results', newResults);
  },
  { immediate: true },
);
</script>

<template>
  <div class="product-search">
    <input v-model="searchQuery" class="search-input" />

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
