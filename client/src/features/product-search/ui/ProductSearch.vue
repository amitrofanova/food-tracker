<script setup lang="ts">
import { useProductSearch } from '../lib/useProductSearch';
import ProductCard from '@/entities/product/ui/ProductCard.vue';
import { AddToDiaryButton } from '@/features/add-to-diary';
import { EntryRow, useDiaryStore } from '@/entities/diary-entry';

const { query, results, loading, search } = useProductSearch();
const diaryStore = useDiaryStore();
</script>

<template>
  <div class="product-search">
    <input
      type="text"
      v-model="query"
      @input="search"
      placeholder="Поиск продуктов..."
      class="search-input"
    />

    <div v-if="loading" class="status">Загрузка...</div>

    <div v-else-if="results.length === 0 && query" class="status">Ничего не найдено</div>

    <div v-else class="results">
      <div v-for="product in results" :key="product.id" class="result-item">
        <ProductCard :product="product" />
        <AddToDiaryButton :product="product" />
      </div>
    </div>

    <div class="diary-preview">
      <EntryRow
        v-for="entry in diaryStore.dailyEntries"
        :key="entry.id"
        :entry="entry"
        @remove="diaryStore.removeEntry"
      />
    </div>
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
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 20px;
}
.status {
  text-align: center;
  color: #666;
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
  border-bottom: 1px solid #eee;
  padding: 8px 0;
}
.result-item > :first-child {
  flex: 1;
}
.diary-preview {
  margin-top: 40px;
  border-top: 2px solid #ccc;
  padding-top: 20px;
}
</style>
