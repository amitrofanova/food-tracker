<template>
  <form @submit.prevent="handleSubmit" class="product-form">
    <h3>Свой продукт</h3>
    <input v-model="form.name" placeholder="Название" required />
    <input v-model.number="form.calories" type="number" placeholder="Калории (на 100г)" required />
    <input v-model.number="form.protein" type="number" step="0.1" placeholder="Белки" required />
    <input v-model.number="form.fat" type="number" step="0.1" placeholder="Жиры" required />
    <input v-model.number="form.carbs" type="number" step="0.1" placeholder="Углеводы" required />
    <button type="submit" :disabled="!isValid">Сохранить</button>
  </form>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useCreateProduct } from '../lib/useCreateProduct';

const emit = defineEmits<{ (e: 'created'): void }>();
const { createProduct } = useCreateProduct();

const form = reactive({
  name: '',
  calories: null as number | null,
  protein: null as number | null,
  fat: null as number | null,
  carbs: null as number | null,
});

const isValid = computed(() => {
  return (
    form.name &&
    form.calories &&
    form.calories > 0 &&
    form.protein &&
    form.protein >= 0 &&
    form.fat &&
    form.fat >= 0 &&
    form.carbs &&
    form.carbs >= 0
  );
});

const handleSubmit = async () => {
  if (!isValid.value) return;
  await createProduct({
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: form.name,
    calories: form.calories!,
    protein: form.protein!,
    fat: form.fat!,
    carbs: form.carbs!,
  });
  form.name = '';
  form.calories = null;
  form.protein = null;
  form.fat = null;
  form.carbs = null;
  emit('created');
};
</script>
