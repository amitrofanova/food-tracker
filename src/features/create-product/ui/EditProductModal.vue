<script setup lang="ts">
import type { IProduct } from '@/entities/product';
import { AppModal } from '@/shared/ui/modal';
import { AppInput } from '@/shared/ui/input';
import { AppButton } from '@/shared/ui/button';

interface EditForm {
  name: string;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
}

interface ValidatedEditForm {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

function isValid(f: EditForm): f is ValidatedEditForm {
  return (
    f.name.trim().length > 0 &&
    typeof f.calories === 'number' &&
    f.calories > 0 &&
    [f.protein, f.fat, f.carbs].every((v): v is number => typeof v === 'number' && v >= 0)
  );
}

const props = defineProps<{
  modelValue: boolean;
  product: IProduct;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', product: IProduct): void;
}>();

const form = reactive<EditForm>({
  name: props.product.name,
  calories: props.product.calories,
  protein: props.product.protein,
  fat: props.product.fat,
  carbs: props.product.carbs,
});

watch(
  () => props.product,
  (p) => {
    form.name = p.name;
    form.calories = p.calories;
    form.protein = p.protein;
    form.fat = p.fat;
    form.carbs = p.carbs;
  },
);

const isFormValid = computed(() => isValid(form));

const handleSubmit = () => {
  if (!isValid(form)) return;
  const updated: IProduct = {
    id: props.product.id,
    name: form.name,
    calories: form.calories,
    protein: form.protein,
    fat: form.fat,
    carbs: form.carbs,
  };
  emit('save', updated);
  emit('update:modelValue', false);
};
</script>

<template>
  <AppModal
    :model-value="modelValue"
    title="Редактировать продукт"
    @update:model-value="emit('update:modelValue', false)"
  >
    <form class="form" @submit.prevent="handleSubmit">
      <AppInput label="Название" v-model="form.name" placeholder="Название" class="full-width" />
      <AppInput
        label="Калории (на 100г)"
        v-model="form.calories"
        type="number"
        placeholder="Калории (на 100г)"
        class="half-width"
      />
      <AppInput
        label="Белки"
        v-model="form.protein"
        type="number"
        placeholder="Белки"
        class="half-width"
      />
      <AppInput
        label="Жиры"
        v-model="form.fat"
        type="number"
        placeholder="Жиры"
        class="half-width"
      />
      <AppInput
        label="Углеводы"
        v-model="form.carbs"
        type="number"
        placeholder="Углеводы"
        class="half-width"
      />
      <AppButton type="submit" :disabled="!isFormValid" :aria-disabled="!isFormValid">
        Сохранить
      </AppButton>
    </form>
  </AppModal>
</template>

<style scoped>
.form {
  display: grid;
  gap: 0.8rem;
  margin-top: 0.6rem;
}

@media (min-width: 768px) {
  .form {
    min-width: 500px;
    grid-template-columns: 1fr 1fr;
  }

  .full-width {
    grid-column: 1 / -1;
  }
}
</style>
