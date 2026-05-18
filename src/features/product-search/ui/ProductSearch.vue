<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual';
import type { IProduct } from '@/entities/product';
import { useProductSearch } from '../lib/useProductSearch';
import ProductSearchItem from './ProductSearchItem.vue';

const emit = defineEmits<{
  (e: 'select', product: IProduct, weight: number): void;
}>();

const {
  searchQuery,
  setSearchQuery,
  results,
  loading,
  error,
  hasMore,
  loadMore,
  isFetchingNextPage,
} = useProductSearch();

const scrollContainerRef = ref<HTMLElement | null>(null);

const virtualizer = useVirtualizer(
  computed(() => ({
    count: hasMore.value ? results.value.length + 1 : results.value.length,
    getScrollElement: () => scrollContainerRef.value,
    estimateSize: () => 80,
    overscan: 5,
  })),
);

const virtualRows = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());

watchEffect(() => {
  if (!scrollContainerRef.value || !hasMore.value || isFetchingNextPage.value) return;

  const [lastItem] = [...virtualRows.value].reverse();
  if (!lastItem) return;

  if (lastItem.index >= results.value.length - 1) {
    loadMore();
  }
});

defineExpose({ clearSearch: () => setSearchQuery('') });
</script>

<template>
  <div class="search-wrap">
    <input
      :value="searchQuery"
      @input="(e) => setSearchQuery((e.target as HTMLInputElement).value)"
      type="search"
      placeholder="Искать продукт или рецепт"
      class="input-search"
    />
    <div ref="scrollContainerRef" class="results">
      <div :style="{ position: 'relative', height: `${totalSize}px`, marginBottom: '50px' }">
        <div
          v-for="virtualRow in virtualRows"
          :key="virtualRow.index"
          :style="{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`,
          }"
        >
          <div
            v-if="virtualRow.index >= results.length && hasMore"
            class="status"
            style="position: static; transform: none"
          >
            <div class="spinner"></div>
          </div>
          <ProductSearchItem
            v-else
            :product="results[virtualRow.index] as IProduct"
            @select="(product, weight) => emit('select', product, weight)"
          />
        </div>
      </div>
      <div
        v-if="loading && !isFetchingNextPage"
        class="status"
        :style="{ position: 'absolute', top: `${totalSize}px` }"
      >
        <div class="spinner"></div>
      </div>
      <div
        v-else-if="error && !isFetchingNextPage"
        class="status"
        :style="{ position: 'absolute', top: `${totalSize}px` }"
      >
        {{ error }}
      </div>
      <div v-else-if="results.length === 0 && searchQuery" class="status">Нет результатов</div>
      <div v-else-if="!results.length && !searchQuery" class="status">
        Введите запрос для поиска
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.input-search {
  width: 100%;
  padding: 10px;
  border-radius: var(--border-radius);
  margin-bottom: 20px;
  font-size: 16px;
}
.results {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  position: relative;
  border-radius: var(--border-radius);
  scrollbar-width: none;
  background: rgba(var(--color-background), 0.5);
}
@media (max-width: 767px) {
  .results {
    padding-bottom: 100px;
  }
}
.status {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  padding: 20px;
  color: var(--color-text-secondary);
}
.spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
