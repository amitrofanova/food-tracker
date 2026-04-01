<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual';
import type { MealType } from '@/shared/config/meals';
import { useProductSearch } from '../lib/useProductSearch';

const { searchQuery, results, loading, error, hasMore, loadMore } = useProductSearch();

defineProps<{ mealType: MealType }>();

const emit = defineEmits(['addEntry']);

const weights = ref<Record<string, number>>({});

const scrollContainerRef = ref<HTMLElement | null>(null);

const virtualizer = useVirtualizer(
  computed(() => ({
    count: results.value.length,
    getScrollElement: () => scrollContainerRef.value,
    estimateSize: () => 80,
    overscan: 5,
  })),
);

const handleScroll = () => {
  const container = scrollContainerRef.value;
  if (!container) return;

  const { scrollTop, scrollHeight, clientHeight } = container;
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    if (hasMore.value && !loading.value) {
      loadMore();
    }
  }
};
</script>

<template>
  <div class="wrap">
    <input v-model="searchQuery" type="search" placeholder="Искать продукт" class="input-search" />
    <div v-if="results.length" ref="scrollContainerRef" class="results" @scroll="handleScroll">
      <div :style="{ height: `${virtualizer.getTotalSize()}px` }" class="virtual-list">
        <div
          v-for="virtualRow in virtualizer.getVirtualItems()"
          :key="virtualRow.key"
          :style="{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualRow.start}px)`,
          }"
        >
          <div class="result-item">
            <div class="item-header">
              <span>{{ results[virtualRow.index].name }}</span>
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
    <div v-if="loading" class="status">Loading</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else-if="results.length === 0 && searchQuery" class="status">No results</div>
  </div>
</template>

<style scoped>
.wrap {
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
}
.input-search {
  width: 100%;
  padding: 10px;
  border-radius: var(--border-radius);
  margin-bottom: 20px;
}
.status {
  text-align: center;
  padding: 20px;
}
.results {
  flex: 1;
  overflow-y: auto;
  position: relative;
}
.virtual-list {
  position: relative;
  width: 100%;
}
.result-item {
  padding: 8px 8px 8px 12px;
  border-radius: var(--border-radius);
  background-color: rgba(var(--color-secondary), 0.2);
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
  border: 1px solid rgba(var(--color-secondary), 0.7);
  border-radius: var(--border-radius);
}
.input-weight {
  appearance: none;
  width: 80px;
  border: none;
  border-radius: 4px 0 0 4px;
  padding-left: 4px;
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
