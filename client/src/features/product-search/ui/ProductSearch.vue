<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual';
import type { IProduct } from '@/entities/product';
import { useProductSearch } from '../lib/useProductSearch';
import { useBarcodeScanner } from '../lib/useBarcodeScanner';
import { AppInput } from '@/shared/ui/input';
import ProductSearchItem from './ProductSearchItem.vue';
import { ButtonIcon } from '@/shared/ui/button';

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

const virtualizer = useVirtualizer(
  computed(() => ({
    count:
      hasMore.value && !barcodeProduct.value
        ? displayResults.value.length + 1
        : displayResults.value.length,
    getScrollElement: () => scrollContainerRef.value,
    estimateSize: () => 80,
    overscan: 5,
  })),
);

const virtualRows = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());

watchEffect(() => {
  if (
    !scrollContainerRef.value ||
    !hasMore.value ||
    isFetchingNextPage.value ||
    barcodeProduct.value
  )
    return;

  const [lastItem] = [...virtualRows.value].reverse();
  if (!lastItem) return;

  if (lastItem.index >= displayResults.value.length - 1) {
    loadMore();
  }
});

defineExpose({
  clearSearch: () => {
    setSearchQuery('');
    barcodeProduct.value = null;
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
            v-if="virtualRow.index >= displayResults.length && hasMore && !barcodeProduct"
            class="status"
            style="position: static; transform: none"
          >
            <div class="spinner"></div>
          </div>
          <ProductSearchItem
            v-else
            :product="displayResults[virtualRow.index] as IProduct"
            @select="(product, weight) => emit('select', product, weight)"
          />
        </div>
      </div>
      <div
        v-if="displayLoading && !isFetchingNextPage"
        class="status"
        :style="{ position: 'absolute', top: `${totalSize}px` }"
      >
        <div class="spinner"></div>
      </div>
      <div
        v-else-if="displayError && !isFetchingNextPage"
        class="status"
        :style="{ position: 'absolute', top: `${totalSize}px` }"
      >
        {{ displayError }}
      </div>
      <div v-else-if="displayResults.length === 0 && searchQuery" class="status">
        Нет результатов
      </div>
      <div v-else-if="!displayResults.length && !searchQuery" class="status">
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
.input-row {
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
  position: relative;
  border-radius: var(--border-radius);
  scrollbar-width: none;
  background: rgba(var(--color-background), 0.5);
}
@media (max-width: 767px) {
  .results {
    margin-bottom: 120px;
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
