<script setup lang="ts">
import { ref } from 'vue';
import type { IProduct } from '@/entities/product/model/types';
import { useDiaryStore } from '@/entities/diary-entry';
import { useBreakpoints } from '@/shared/lib/breakpoints';
import { MEAL_TYPES, MEAL_LABELS, type MealType } from '@/shared/config/meals';
import { AppModal } from '@/shared/ui/modal';
import { CreateProductForm } from '@/features/create-product';
import { ProductSearch } from '@/features/product-search';

const diaryStore = useDiaryStore();
const { isMobile } = useBreakpoints();
const props = defineProps<{ mealType?: MealType }>();
const selectedMeal = ref<MealType>(props.mealType || 'breakfast');
const showModal = ref(false);

const addEntry = (product: IProduct, weight: number, mealType: MealType) => {
  const factor = weight / 100;
  diaryStore.addEntry({
    date: diaryStore.selectedDate,
    productId: product.id,
    productName: product.name,
    mealType,
    weight,
    calories: Math.round(product.calories * factor),
    protein: Math.round(product.protein * factor * 10) / 10,
    fat: Math.round(product.fat * factor * 10) / 10,
    carbs: Math.round(product.carbs * factor * 10) / 10,
  });
};
</script>

<template>
  <div>
    <div v-if="!isMobile" class="controls">
      <select v-model="selectedMeal" class="meal-select">
        <option v-for="type in MEAL_TYPES" :key="type" :value="type">
          {{ MEAL_LABELS[type] }}
        </option>
      </select>
      <button @click="showModal = true" class="btn-create">+ Свой продукт</button>
    </div>
    <AppModal v-model="showModal" :width="isMobile ? '100vh' : 'auto'">
      <CreateProductForm @created="showModal = false" />
    </AppModal>
    <ProductSearch :mealType="selectedMeal" @addEntry="addEntry" />
    <button v-if="isMobile" @click="showModal = true" class="btn-create">+</button>
  </div>
</template>

<style scoped>
.controls {
  margin-bottom: 1rem;
  display: flex;
}
.btn-create {
  margin-left: auto;
  appearance: none;
  border: none;
  border-radius: 10px;
  background-color: rgb(var(--color-secondary));
  color: #fff;
  font-weight: bold;
}
@media (max-width: 767px) {
  .btn-create {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    width: 36px;
    height: 36px;
    font-size: 28px;
    line-height: 28px;
  }
}
@media (min-width: 768px) {
  .btn-create {
    padding: 8px;
  }
}
.meal-select {
  padding: 4px;
}
</style>
