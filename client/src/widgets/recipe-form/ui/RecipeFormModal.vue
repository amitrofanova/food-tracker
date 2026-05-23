<script setup lang="ts">
import type { IRecipe } from '@/entities/recipe';
import type { MealType } from '@/shared/config/meals';
import { AppModal } from '@/shared/ui/modal';
import RecipeForm from './RecipeForm.vue';

defineProps<{
  modelValue: boolean;
  initialRecipe?: IRecipe;
  title?: string;
  defaultMeal?: MealType;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'saved', recipe: IRecipe): void;
  (e: 'added'): void;
  (e: 'closed'): void;
}>();

const close = () => emit('update:modelValue', false);
</script>

<template>
  <AppModal
    :model-value="modelValue"
    :title="title"
    width="1000px"
    @update:model-value="close"
    @closed="emit('closed')"
  >
    <RecipeForm
      :initial-recipe="initialRecipe"
      :default-meal="defaultMeal"
      @saved="(r) => emit('saved', r)"
      @added="
        emit('added');
        close();
      "
      @cancel="close"
      style="overflow: hidden; height: 700px"
    />
  </AppModal>
</template>
