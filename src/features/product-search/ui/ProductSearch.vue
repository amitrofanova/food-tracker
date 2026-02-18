<script setup lang="ts">
import { useProductSearch } from '../lib/useProductSearch';
import ProductCard from '@/entities/product/ui/ProductCard.vue';
import { AddToDiaryButton } from '@/features/add-to-diary';
import { EntryRow, useDiaryStore } from '@/entities/diary-entry';
import AddProductBtn from '@/features/add-to-diary/ui/AddProductBtn.vue';
import AddToDiaryForm from '@/features/add-to-diary/ui/AddToDiaryForm.vue';

const { searchQuery, results, loading, error, hasMore, loadMore } = useProductSearch();
const diaryStore = useDiaryStore();
</script>

<template>
  <div class="product-search">
    <input v-model="searchQuery" class="search-input" />

    <div class="results">
      <div v-for="product in results" :key="product.id" class="result-item">
        <ProductCard :product="product" />
        <AddToDiaryForm :product="product" />
      </div>
    </div>
    <div v-if="loading" class="status">Загрузка...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else-if="results.length === 0 && searchQuery" class="status">Ничего не найдено</div>

    <button v-if="results.length && hasMore && !loading" @click="loadMore" class="load-more">
      Загрузить ещё
    </button>

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
