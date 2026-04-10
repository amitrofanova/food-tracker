<script setup lang="ts">
import { Icon } from '@/shared/ui/icon';

interface SelectOption {
  value: string;
  label: string;
}

withDefaults(
  defineProps<{
    options: SelectOption[];
    modelValue: string;
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    placeholder: '',
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <div class="select-wrapper" :style="{ opacity: disabled ? 0.7 : 1 }">
    <select
      v-bind="$attrs"
      :value="modelValue"
      :disabled="disabled"
      class="app-select"
      @change="handleChange"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <Icon name="ArrowDown" color="white" class="select-icon" />
  </div>
</template>

<style scoped>
.select-wrapper {
  position: relative;
  max-width: max-content;
  display: flex;
  border-radius: var(--border-radius);
  background-color: rgb(var(--color-secondary));
  transition: opacity 0.2s ease-in-out 0.1s;
}
.select-wrapper:hover {
  opacity: 0.9;
}
.app-select {
  appearance: none;
  padding: 10px 38px 10px 16px;
  border: none;
  outline: none;
  background-color: transparent;
  color: white;
  z-index: 1;
  cursor: pointer;
}
.app-select:hover {
  opacity: 0.9;
}
.app-select:disabled {
  cursor: not-allowed;
}
.select-icon {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
}
option {
  color: rgb(var(--color-primary));
}
</style>
