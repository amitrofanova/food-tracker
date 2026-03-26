<script setup lang="ts">
import { ref } from 'vue';
import type { IProduct } from '@/entities/product/model/types';
import { useDiaryStore } from '@/entities/diary-entry';
import { useBreakpoints } from '@/shared/lib/breakpoints';
import { MEAL_TYPES, MEAL_LABELS, type MealType } from '@/shared/config/meals';
import { AppModal } from '@/shared/ui/modal';
import { CreateProductForm } from '@/features/create-product';
import { ProductSearch } from '@/features/product-search';
import { Icon } from '@/shared/ui/icon';

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
      <div class="select-wrapper">
        <select name="selectMeal" v-model="selectedMeal" class="meal-select">
          <option v-for="type in MEAL_TYPES" :key="type" :value="type">
            {{ MEAL_LABELS[type] }}
          </option>
        </select>
        <Icon name="ArrowDown" color="white" class="select-icon" />
      </div>
      <button @click="showModal = true" class="btn-create">
        <Icon name="PlusSymbol" /> Свой продукт
      </button>
    </div>
    <AppModal v-model="showModal" :width="isMobile ? '100vh' : 'auto'">
      <CreateProductForm @created="showModal = false" />
    </AppModal>
    <ProductSearch :mealType="selectedMeal" @addEntry="addEntry" />
    <button v-if="isMobile" @click="showModal = true" class="btn-create">
      <Icon name="PlusSymbol" />
    </button>
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
  border-radius: 6px;
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
    padding: 8px 10px 8px 6px;
  }
}
.select-wrapper {
  position: relative;
  display: flex;
  border-radius: 6px;
  background-color: rgb(var(--color-secondary));
}
.meal-select {
  appearance: none;
  padding: 4px 32px 4px 8px;
  border: none;
  outline: none;
  background-color: transparent;
  color: white;
}
.select-icon {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
}
option {
  color: rgb(var(--color-primary));
}
</style>
