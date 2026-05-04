<script setup lang="ts">
import { AppButton } from '@/shared/ui/button';
import type { IProduct } from '@/entities/product';
import { useCreateProduct } from '../lib/useCreateProduct';

const { createProduct } = useCreateProduct();

const emit = defineEmits<{
  created: [product: IProduct];
}>();

interface ProductForm {
  name: string;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
}

interface ValidatedProductForm {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

function isValidProductForm(f: ProductForm): f is ValidatedProductForm {
  return (
    f.name.trim().length > 0 &&
    typeof f.calories === 'number' &&
    f.calories > 0 &&
    [f.protein, f.fat, f.carbs].every((v): v is number => typeof v === 'number' && v >= 0)
  );
}

const form = reactive<ProductForm>({
  name: '',
  calories: null,
  protein: null,
  fat: null,
  carbs: null,
});

const isValid = computed(() => isValidProductForm(form));

const resetForm = () => {
  form.name = '';
  form.calories = null;
  form.protein = null;
  form.fat = null;
  form.carbs = null;
};

const handleSubmit = async () => {
  if (!isValidProductForm(form)) return;

  const newProduct: IProduct = {
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: form.name,
    calories: form.calories,
    protein: form.protein,
    fat: form.fat,
    carbs: form.carbs,
  };
  await createProduct(newProduct);
  resetForm();
  emit('created', newProduct);
};
</script>

<template>
  <div>
    <h3 id="create-product-title">Свой продукт</h3>
    <form aria-labelledby="create-product-title" class="form" @submit.prevent="handleSubmit">
      <input
        id="product-name"
        v-model="form.name"
        name="name"
        placeholder="Название"
        required
        aria-required="true"
        class="full-width"
      />
      <input
        v-model.number="form.calories"
        name="calories"
        type="number"
        min="1"
        placeholder="Калории (на 100г)"
        required
        aria-required="true"
        class="half-width"
      />
      <input
        v-model.number="form.protein"
        name="protein"
        type="number"
        min="0"
        step="0.1"
        placeholder="Белки"
        required
        aria-required="true"
        class="half-width"
      />
      <input
        v-model.number="form.fat"
        name="fat"
        type="number"
        min="0"
        step="0.1"
        placeholder="Жиры"
        required
        aria-required="true"
        class="half-width"
      />
      <input
        v-model.number="form.carbs"
        name="carbs"
        type="number"
        min="0"
        step="0.1"
        placeholder="Углеводы"
        required
        aria-required="true"
        class="half-width"
      />
      <AppButton type="submit" :disabled="!isValid" :aria-disabled="!isValid">Сохранить</AppButton>
    </form>
  </div>
</template>

<style scoped>
.form {
  display: grid;
  gap: 0.8rem;
  margin-top: 0.6rem;
}
input {
  appearance: none;
  border: 1px solid rgba(var(--color-secondary), 0.7);
  border-radius: var(--border-radius);
  padding: 6px;
  outline: none;
}
@media (min-width: 768px) {
  .form {
    min-width: 500px;
    grid-template-columns: 1fr 1fr;
  }
  .full-width {
    grid-column: 1 / -1;
  }
  .half-width {
    grid-column: 1fr;
  }
}
</style>
