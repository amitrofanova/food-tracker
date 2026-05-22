<script setup lang="ts">
import { Icon } from '@/shared/ui/icon';

defineProps<{
  disabled: boolean;
  size?: 'sm' | 'md' | 'lg';
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
  <div class="item-controls" :class="`item-controls_${size ?? 'md'}`">
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
  border: 1px solid rgba(var(--color-darkgreen), 0.7);
  border-radius: var(--border-radius);
  overflow: hidden;
}
.item-controls_sm .input-weight,
.item-controls_sm .button-add {
  height: 30px;
}
.item-controls_sm .input-weight {
  font-size: 0.9em;
}
.item-controls_md .input-weight,
.item-controls_md .button-add {
  height: 40px;
}
.item-controls_lg .input-weight,
.item-controls_lg .button-add {
  height: 50px;
}
.input-weight {
  appearance: none;
  width: 80px;
  border: none;
  border-radius: 4px 0 0 4px;
  padding: 0 6px;
  outline: none;
}
.button-add {
  appearance: none;
  border: 0;
  background-color: rgb(var(--color-darkgreen));
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
