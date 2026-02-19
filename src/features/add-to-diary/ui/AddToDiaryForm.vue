<script setup lang="ts">
import { ref } from 'vue';
import type { IProduct } from '@/entities/product';
import type { MealType } from '@/shared/config/meals';
import { useAddToDiary } from '../lib/useAddToDiary';

const props = defineProps<{ product: IProduct; mealType: MealType }>();
const { addEntry } = useAddToDiary();

const weight = ref<number | null>(null);

const handleAdd = () => {
  if (weight.value && weight.value > 0) {
    addEntry(props.product, weight.value, props.mealType);
    weight.value = null;
    // TODO оставить выбранный приём или сбросить на завтрак
  }
};
</script>

<template>
  <div class="add-to-diary-form">
    <input
      type="number"
      v-model.number="weight"
      placeholder="Вес (г)"
      min="1"
      class="weight-input"
    />
    <button @click="handleAdd" :disabled="!weight" class="add-btn">+</button>
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
