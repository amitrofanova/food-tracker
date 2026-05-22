<script setup lang="ts">
import type { IProduct } from '@/entities/product';
import { AddEntryControls } from '@/entities/diary-entry';

const props = defineProps<{
  product: IProduct;
}>();

const emit = defineEmits<{
  (e: 'select', product: IProduct, weight: number): void;
}>();

const handleAddEntry = (weight: number) => {
  emit('select', props.product, weight);
};
</script>

<template>
  <div class="result-item">
    <div class="item-header">{{ product.name }}</div>
    <div class="item-info">
      <div class="macros">
        <span>{{ product.calories }} ккал</span>
        <span>Б: {{ product.protein }}</span>
        <span>Ж: {{ product.fat }}</span>
        <span>У: {{ product.carbs }}</span>
      </div>
      <AddEntryControls :disabled="false" @add-entry="handleAddEntry" />
    </div>
  </div>
</template>

<style scoped>
.result-item {
  padding: 8px 8px 8px 12px;
  border-radius: var(--border-radius);
  background-color: rgb(var(--bg-warm));
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
</style>
