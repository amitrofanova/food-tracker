<script setup lang="ts">
import type { IProduct } from '@/entities/product';
import type { MealType } from '@/shared/config/meals';
import { AppModal } from '@/shared/ui/modal';
import CreateProductForm from './CreateProductForm.vue';
import AddEntryForm from './AddEntryForm.vue';

defineProps<{
  modelValue: boolean;
  defaultMeal?: MealType;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'created', product: IProduct): void;
  (e: 'add-entry', product: IProduct, weight: number, mealType: MealType): void;
}>();

const createdProduct = ref<IProduct | null>(null);
const enabledAddProductForm = ref(false);

const handleCreated = (product: IProduct) => {
  createdProduct.value = product;
  enabledAddProductForm.value = true;
  emit('created', product);
};

const handleAddEntry = (weight: number, mealType: MealType) => {
  if (createdProduct.value) {
    emit('add-entry', createdProduct.value, weight, mealType);
    createdProduct.value = null;
    enabledAddProductForm.value = false;
    emit('update:modelValue', false);
  }
};

const handleClose = (open: boolean) => {
  if (!open) {
    createdProduct.value = null;
    enabledAddProductForm.value = false;
    emit('update:modelValue', false);
  }
};
</script>

<template>
  <AppModal :model-value="modelValue" @update:model-value="handleClose">
    <div class="product-modal">
      <CreateProductForm @created="handleCreated" />
      <AddEntryForm
        :disabled="!enabledAddProductForm"
        :new-product="createdProduct"
        :default-meal="defaultMeal"
        @add-entry="handleAddEntry"
      />
    </div>
  </AppModal>
</template>

<style scoped>
.product-modal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
