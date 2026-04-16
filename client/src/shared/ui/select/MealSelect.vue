<script setup lang="ts">
import { MEAL_TYPES, MEAL_LABELS, type MealType } from '@/shared/config/meals';
import AppSelect from './AppSelect.vue';

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

const options = MEAL_TYPES.map((type) => ({
  value: type,
  label: MEAL_LABELS[type],
}));

const isMealType = (value: string): value is MealType => value in MEAL_LABELS;

const handleUpdate = (value: string) => {
  if (isMealType(value)) {
    emit('update:modelValue', value);
  }
};
</script>

<template>
  <AppSelect
    :options="options"
    :modelValue="modelValue"
    :disabled="disabled"
    @update:modelValue="handleUpdate"
  />
</template>
