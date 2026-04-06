<script setup lang="ts">
import type { IProduct } from '@/entities/product';
import type { MealType } from '@/shared/config/meals';
import { Icon } from '@/shared/ui/icon';

const props = defineProps<{
  product: IProduct;
  weight: number | undefined;
  mealType: MealType;
}>();

const emit = defineEmits<{
  (e: 'update:weight', weight: number | undefined): void;
  (e: 'addEntry', product: IProduct, weight: number, mealType: MealType): void;
}>();

const isAdded = ref(false);
let resetTimeout: ReturnType<typeof setTimeout>;

const handleAdd = () => {
  if (!props.weight) return;

  isAdded.value = true;
  emit('addEntry', props.product, props.weight, props.mealType);

  clearTimeout(resetTimeout);
  resetTimeout = setTimeout(() => {
    isAdded.value = false;
    emit('update:weight', undefined);
  }, 1000);
};

onUnmounted(() => clearTimeout(resetTimeout));
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
      <div class="item-controls">
        <input
          type="number"
          :value="weight"
          @input="
            (e) => emit('update:weight', Number((e.target as HTMLInputElement).value) || undefined)
          "
          placeholder="Вес (г)"
          min="1"
          class="input-weight"
        />
        <button :disabled="!weight || isAdded" class="button-add" @click="handleAdd">
          <Icon :name="isAdded ? 'Checkmark' : 'PlusSymbol'" size="sm" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  transition: background-color 0.2s;
}
.button-add:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
