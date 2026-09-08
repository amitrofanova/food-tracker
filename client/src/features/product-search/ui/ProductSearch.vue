<script setup lang="ts">
import type { IProduct } from '@/entities/product';
import { useProductSearch } from '../lib/useProductSearch';
import { useLoadMoreOnScroll } from '../lib/useLoadMoreOnScroll';
import { useBarcodeScanner } from '../lib/useBarcodeScanner';
import { AppInput } from '@/shared/ui/input';
import ProductSearchItem from './ProductSearchItem.vue';
import { ButtonIcon } from '@/shared/ui/button';

const emit = defineEmits<{
  (e: 'select', product: IProduct, weight: number): void;
}>();

const props = defineProps<{ suggestedWeight?: number }>();

const {
  searchQuery,
  setSearchQuery,
  results,
  loading,
  error,
  hasMore,
  loadMore,
  isFetchingMore,
  isFetchingNextPage,
} = useProductSearch();

const { scan, scanning, scanError, isNative } = useBarcodeScanner();

const barcodeProduct = ref<IProduct | null>(null);

const displayResults = computed(() =>
  barcodeProduct.value ? [barcodeProduct.value] : results.value,
);
const displayLoading = computed(() => loading.value || scanning.value);
const displayError = computed(() => error.value || scanError.value);

const handleBarcodeScan = async () => {
  barcodeProduct.value = null;
  const product = await scan();
  if (product) barcodeProduct.value = product;
};

const handleTextInput = (val: string) => {
  barcodeProduct.value = null;
  scanError.value = null;
  setSearchQuery(val);
};

const scrollContainerRef = ref<HTMLElement | null>(null);

const canLoadMore = computed(
  () =>
    !barcodeProduct.value && !!hasMore.value && !isFetchingNextPage.value && !displayLoading.value,
);

const { onScroll } = useLoadMoreOnScroll(scrollContainerRef, loadMore, {
  enabled: canLoadMore,
  loadedCount: () => displayResults.value.length,
});

watch(searchQuery, () => {
  if (scrollContainerRef.value) scrollContainerRef.value.scrollTop = 0;
});

defineExpose({
  clearSearch: () => {
    setSearchQuery('');
    barcodeProduct.value = null;
  },
  setQuery: (q: string) => {
    barcodeProduct.value = null;
    setSearchQuery(q);
  },
});
</script>

<template>
  <div class="search-wrap">
    <div class="input-row">
      <AppInput
        :model-value="searchQuery"
        @update:model-value="handleTextInput(String($event ?? ''))"
        type="search"
        placeholder="Искать продукт или рецепт"
        class="input-search"
      />
      <ButtonIcon
        v-if="isNative"
        name="Barcode"
        class="btn-barcode"
        :class="{ scanning }"
        :disabled="scanning"
        aria-label="Сканировать штрихкод"
        @click="handleBarcodeScan"
      >
      </ButtonIcon>
    </div>
    <div ref="scrollContainerRef" class="results" @scroll.passive="onScroll">
      <div v-if="displayResults.length" class="results-list">
        <ProductSearchItem
          v-for="product in displayResults"
          :key="product.id"
          :product="product"
          :suggested-weight="props.suggestedWeight"
          @select="(selected, weight) => emit('select', selected, weight)"
        />
      </div>
      <div v-if="isFetchingMore" class="status">
        <div class="spinner"></div>
      </div>
      <div v-else-if="displayLoading" class="status status--overlay">
        <div class="spinner"></div>
      </div>
      <div v-else-if="displayError && !displayResults.length" class="status status--overlay">
        {{ displayError }}
      </div>
      <div v-else-if="displayError" class="status">
        {{ displayError }}
      </div>
      <div v-else-if="displayResults.length === 0 && searchQuery" class="status status--overlay">
        Нет результатов
      </div>
      <div v-else-if="!displayResults.length && !searchQuery" class="status status--overlay">
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
  overflow: hidden;
}
.input-row {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}
.input-search {
  flex: 1;
  font-size: 16px;
}
.input-search :deep(.input) {
  padding: 10px;
  border-radius: var(--border-radius);
}
.btn-barcode {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
  color: rgb(var(--color-darkgreen));
  transition: background-color 0.15s;
}

.btn-barcode:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-barcode.scanning {
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
.results {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
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
.results-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.status {
  text-align: center;
  padding: 20px;
  color: var(--color-text-secondary);
}
.status--overlay {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
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
