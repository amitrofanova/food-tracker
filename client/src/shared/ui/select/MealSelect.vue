<script setup lang="ts">
import { MEAL_TYPES, MEAL_LABELS, type MealType } from '@/shared/config/meals';
import { Icon } from '@/shared/ui/icon';

withDefaults(
  defineProps<{
    modelValue: MealType;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: MealType): void;
}>();

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value as MealType);
};
</script>

<template>
  <div class="select-wrapper" :style="{ opacity: disabled ? 0.7 : 1 }">
    <select
      name="selectMeal"
      :value="modelValue"
      :disabled="disabled"
      class="meal-select"
      @change="handleChange"
    >
      <option v-for="type in MEAL_TYPES" :key="type" :value="type">
        {{ MEAL_LABELS[type] }}
      </option>
    </select>
    <Icon name="ArrowDown" color="white" class="select-icon" />
  </div>
</template>

<style scoped>
.select-wrapper {
  position: relative;
  display: flex;
  border-radius: var(--border-radius);
  background-color: rgb(var(--color-secondary));
  transition: opacity 0.2s ease-in-out 0.1s;
}
.select-wrapper:hover {
  opacity: 0.9;
}
.meal-select {
  appearance: none;
  padding: 10px 38px 10px 16px;
  border: none;
  outline: none;
  background-color: transparent;
  color: white;
  z-index: 1;
  cursor: pointer;
}
.meal-select:hover {
  opacity: 0.9;
}
.meal-select:disabled {
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
