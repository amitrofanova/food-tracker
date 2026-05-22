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
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    placeholder: '',
    disabled: false,
    size: 'md',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const handleChange = (event: Event) => {
  if (event.target instanceof HTMLSelectElement) {
    emit('update:modelValue', event.target.value);
  }
};
</script>

<template>
  <div class="select-wrapper" :class="{ 'select-wrapper_disabled': disabled }">
    <select
      v-bind="$attrs"
      :value="modelValue"
      :disabled="disabled"
      class="select"
      :class="`select_${size}`"
      @change="handleChange"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <Icon name="ArrowDown" color="rgb(var(--text-secondary))" class="icon" />
  </div>
</template>

<style scoped>
.select-wrapper {
  position: relative;
  max-width: max-content;
  display: flex;
  border-radius: var(--border-radius);
  background-color: rgb(var(--color-darkgreen));
  transition: opacity 0.2s ease-in-out 0.1s;
}
.select-wrapper:hover {
  opacity: 0.9;
}
.select-wrapper_disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.select-wrapper_disabled:hover {
  opacity: 0.7;
}
.select {
  appearance: none;
  padding-right: 38px;
  border: none;
  outline: none;
  background-color: transparent;
  color: rgb(var(--text-secondary));
  z-index: 1;
  cursor: pointer;
}
.select:hover {
  opacity: 0.9;
}
.select:disabled {
  cursor: not-allowed;
}
.select_sm {
  height: 30px;
  padding: 0 38px 0 12px;
  font-size: 0.9em;
}
.select_md {
  height: 40px;
  padding: 0 38px 0 16px;
}
.select_lg {
  height: 50px;
  padding: 0 38px 0 20px;
  font-size: 1.1em;
}
.icon {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
}
option {
  color: rgb(var(--color-darkgreen));
}
</style>
