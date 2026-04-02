<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual';
import type { MealType } from '@/shared/config/meals';
import { useProductSearch } from '../lib/useProductSearch';

const props = defineProps<{ mealType: MealType }>();
const emit = defineEmits(['addEntry']);

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

    <div v-if="results.length || loading" ref="scrollContainerRef" class="results">
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
          <div v-if="virtualRow.index >= results.length" class="loader-item">
            {{ hasMore ? 'Загрузка...' : 'Больше нет продуктов' }}
          </div>

          <div v-else class="result-item">
            <div class="item-header">
              {{ results[virtualRow.index].name }}
            </div>
            <div class="item-info">
              <div class="macros">
                <span>{{ results[virtualRow.index].calories }} ккал</span>
                <span>Б: {{ results[virtualRow.index].protein }}</span>
                <span>Ж: {{ results[virtualRow.index].fat }}</span>
                <span>У: {{ results[virtualRow.index].carbs }}</span>
              </div>
              <div class="item-controls">
                <input
                  type="number"
                  v-model.number="weights[results[virtualRow.index].id]"
                  placeholder="Вес (г)"
                  min="1"
                  class="input-weight"
                />
                <button
                  :disabled="!weights[results[virtualRow.index].id]"
                  class="button-add"
                  @click="
                    emit(
                      'addEntry',
                      results[virtualRow.index],
                      weights[results[virtualRow.index].id],
                      mealType,
                    )
                  "
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading && !isFetchingNextPage" class="status">Поиск...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else-if="results.length === 0 && searchQuery" class="status">Нет результатов</div>
    <div v-else-if="!searchQuery && !results.length" class="status hint">
      Введите запрос для поиска
    </div>
  </div>
</template>

<style scoped>
.search-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
}
/* @media (max-width: 768px) {
  .search-wrap {
    height: calc(100vh - 2 * var(--padding));
  }
} */
.input-search {
  width: 100%;
  padding: 10px;
  border-radius: var(--border-radius);
  margin-bottom: 20px;
  font-size: 16px;
}
.status {
  text-align: center;
  padding: 20px;
  color: var(--color-text-secondary);
}
.status.error {
  color: var(--color-error);
}
.status.hint {
  color: var(--color-text-secondary);
  font-style: italic;
}
.results {
  flex: 1;
  overflow-y: auto;
  position: relative;
  border-radius: var(--border-radius);
  scrollbar-width: none;
  background: rgba(var(--color-background), 0.5);
}
.loader-item {
  padding: 16px;
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
}
.result-item {
  padding: 8px 8px 8px 12px;
  border-radius: var(--border-radius);
  background-color: rgba(var(--color-secondary), 0.2);
  margin: 4px 8px;
}
.item-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.item-header {
  width: 100%;
  text-overflow: ellipsis;
  overflow-x: hidden;
  white-space: nowrap;
  font-weight: 700;
  font-size: 16px;
}
.macros {
  display: flex;
  gap: 10px;
  font-size: 14px;
  color: var(--color-text-secondary);
}
.item-controls {
  display: flex;
  border: 1px solid rgba(var(--color-secondary), 0.7);
  border-radius: var(--border-radius);
  overflow: hidden;
}
.input-weight {
  appearance: none;
  width: 80px;
  border: none;
  border-radius: 4px 0 0 4px;
  padding: 8px 4px;
  outline: none;
  background: rgba(var(--color-background), 0.8);
}
.button-add {
  appearance: none;
  border: 0;
  background-color: rgb(var(--color-secondary));
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.button-add:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
