<script setup lang="ts">
import { Icon } from '@/shared/ui/icon';

defineProps<{
  disabled: boolean;
}>();

const emit = defineEmits<{
  (e: 'add-entry', weight: number): void;
}>();

const weight = ref<number>();
const isAdded = ref(false);

const handleAdd = () => {
  if (!weight.value || weight.value <= 0) return;
  isAdded.value = true;
  emit('add-entry', weight.value);
  setTimeout(() => {
    isAdded.value = false;
    weight.value = undefined;
  }, 1000);
};
</script>

<template>
  <div class="item-controls">
    <input
      type="number"
      name="product-weight"
      v-model="weight"
      :disabled="disabled || isAdded"
      placeholder="Вес (г)"
      min="1"
      class="input-weight"
    />
    <button :disabled="!weight || disabled || isAdded" class="button-add" @click="handleAdd">
      <Icon :name="isAdded ? 'Checkmark' : 'PlusSymbol'" size="sm" />
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
