<script setup lang="ts">
import { ref } from 'vue';
import type { IProduct } from '@/entities/product/model/types';
import { useDiaryStore } from '@/entities/diary-entry';
import { useBreakpoints } from '@/shared/lib/breakpoints';
import { MEAL_TYPES, MEAL_LABELS, type MealType } from '@/shared/config/meals';
import { ProductSearch } from '@/features/product-search';

const diaryStore = useDiaryStore();

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

const props = defineProps<{ mealType: MealType }>();
const selectedMeal = ref<MealType>(props.mealType || 'breakfast');
const weight = ref<number>();

const { isDesktop } = useBreakpoints();
</script>

<template>
  <div>
    <div class="controls">
      <select v-if="isDesktop" v-model="selectedMeal" class="meal-select">
        <option v-for="type in MEAL_TYPES" :key="type" :value="type">
          {{ MEAL_LABELS[type] }}
        </option>
      </select>
      <input type="number" v-model.number="weight" placeholder="Вес (г)" min="1" />
    </div>
    <ProductSearch :weight="weight" :mealType="selectedMeal" @addEntry="addEntry" />
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  gap: 10px;
}
.create-btn {
  margin-left: auto;
}
.meal-select {
  padding: 4px;
}
</style>
