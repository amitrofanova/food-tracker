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
  }
};
</script>

<template>
  <div class="form">
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
.form {
  display: flex;
  gap: 8px;
  align-items: center;
}
.weight-input {
  width: 60px;
}
.add-btn {
  padding: 4px;
  cursor: pointer;
}
.add-btn:disabled {
  cursor: not-allowed;
}
</style>
