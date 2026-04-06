<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual';
import type { IProduct } from '@/entities/product';
import type { MealType } from '@/shared/config/meals';
import { useProductSearch } from '../lib/useProductSearch';
import ProductSearchItem from './ProductSearchItem.vue';

const props = defineProps<{ mealType: MealType }>();
const emit = defineEmits<{
  (e: 'addEntry', product: IProduct, weight: number, mealType: MealType): void;
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

const weights = ref<Record<string, number>>({});
const scrollContainerRef = ref<HTMLElement | null>(null);

const virtualizer = useVirtualizer(
  computed(() => ({
    count: hasMore.value ? results.value.length + 1 : results.value.length,
    getScrollElement: () => scrollContainerRef.value,
    estimateSize: () => 90,
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

const handleWeightUpdate = (productId: string, weight: number | undefined) => {
  weights.value[productId] = weight;
};
</script>

<template>
  <div class="search-wrap">
    <input
      :value="searchQuery"
      @input="(e) => setSearchQuery((e.target as HTMLInputElement).value)"
      type="search"
      placeholder="Искать продукт"
      class="input-search"
    />
    <div ref="scrollContainerRef" class="results">
      <div :style="{ height: `${totalSize.value}px`, position: 'relative', width: '100%' }">
        <div
          v-for="virtualRow in virtualRows"
          :key="virtualRow.key"
          :style="{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`,
          }"
        >
          <div v-if="virtualRow.index >= results.length && hasMore" class="status" style="top: 0">
            <div class="spinner"></div>
          </div>
          <ProductSearchItem
            v-else
            :key="results[virtualRow.index]?.id"
            :product="results[virtualRow.index]"
            :weight="weights[results[virtualRow.index].id]"
            :meal-type="mealType"
            @update:weight="(w) => handleWeightUpdate(results[virtualRow.index].id, w)"
            @add-entry="(product, weight) => emit('addEntry', product, weight, mealType)"
          />
        </div>
      </div>
    </div>
    <div
      v-if="loading && !isFetchingNextPage"
      class="status"
      :style="{ top: `${totalSize + 70}px` }"
    >
      <div class="spinner"></div>
    </div>
    <div v-else-if="error" class="status" :style="{ top: `${totalSize + 70}px` }">
      {{ error }}
    </div>
    <div v-else-if="results.length === 0 && searchQuery" class="status">Нет результатов</div>
    <div v-else-if="!results.length && !searchQuery" class="status">Введите запрос для поиска</div>
  </div>
</template>

<style scoped>
.search-wrap {
  position: relative;
  flex: 1;
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
  overflow-y: auto;
  position: relative;
  border-radius: var(--border-radius);
  scrollbar-width: none;
  background: rgba(var(--color-background), 0.5);
}
.status {
  position: absolute;
  top: 50px;
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
