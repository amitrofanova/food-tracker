<script setup lang="ts">
import { ref } from 'vue';
import type { IProduct } from '@/entities/product';
import { useAddToDiary } from '../lib/useAddToDiary';
import { MEAL_TYPES, MEAL_LABELS, type MealType } from '@/shared/config/meals';

const props = defineProps<{ product: IProduct }>();
const { addEntry } = useAddToDiary();

const selectedMeal = ref<MealType>('breakfast');
const weight = ref<number | null>(null);

const handleAdd = () => {
  if (weight.value && weight.value > 0) {
    addEntry(props.product, weight.value, selectedMeal.value);
    weight.value = null;
    // TODO оставить выбранный приём или сбросить на завтрак
  }
};
</script>

<template>
  <div class="add-to-diary-form">
    <select v-model="selectedMeal" class="meal-select">
      <option v-for="type in MEAL_TYPES" :key="type" :value="type">
        {{ MEAL_LABELS[type] }}
      </option>
    </select>
    <input
      type="number"
      v-model.number="weight"
      placeholder="Вес (г)"
      min="1"
      class="weight-input"
    />
    <button @click="handleAdd" :disabled="!weight" class="add-btn">Добавить</button>
  </div>
</template>

<style scoped>
.add-to-diary-form {
  display: flex;
  gap: 8px;
  align-items: center;
}
.meal-select {
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.weight-input {
  width: 80px;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.add-btn {
  padding: 4px 8px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.add-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
