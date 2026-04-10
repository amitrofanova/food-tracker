<script setup lang="ts">
import { Icon } from '@/shared/ui/icon';

defineProps<{
  disabled: boolean;
}>();

defineEmits<{
  (e: 'add-entry', weight: number): void;
}>();

const weight = ref<number>();
</script>

<template>
  <div class="item-controls">
    <input
      type="number"
      name="product-weight"
      v-model="weight"
      :disabled="disabled"
      placeholder="Вес (г)"
      min="1"
      class="input-weight"
    />
    <button
      :disabled="!weight || disabled"
      class="button-add"
      @click="$emit('add-entry', weight as number)"
    >
      <Icon name="PlusSymbol" size="sm" />
    </button>
  </div>
</template>
<style scoped>
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
  padding: 6px;
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
