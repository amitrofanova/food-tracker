<script setup lang="ts">
import { MealSelect } from '@/shared/ui/select';
import type { MealType } from '@/shared/config/meals';
import type { IProduct } from '@/entities/product';
import { AddEntryControls } from '@/entities/diary-entry';

defineProps<{
  disabled: boolean;
  newProduct: IProduct | null;
}>();

const emit = defineEmits<{ 'add-entry': [weight: number, mealType: MealType] }>();

const form = reactive<{ meal: MealType }>({
  meal: 'breakfast',
});

const addEntry = (weight: number) => {
  emit('add-entry', weight, form.meal);
};
</script>

<template>
  <div>
    <h3>Добавить к приёму пищи</h3>
    <form @submit.prevent class="form">
      <MealSelect v-model="form.meal" :disabled="disabled" />
      <AddEntryControls :disabled="disabled" @add-entry="addEntry" />
    </form>
  </div>
</template>

<style scoped>
.form {
  display: flex;
  gap: 1rem;
  margin-top: 0.6rem;
}
</style>
