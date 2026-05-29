<script setup lang="ts">
import type { IProduct } from '@/entities/product';
import type { IRecipe, IRecipeIngredient } from '@/entities/recipe';
import { IngredientEditModal } from '@/entities/recipe';
import { ProductSearch } from '@/features/product-search';
import { AddEntryForm } from '@/features/create-product';
import { useDiaryStore } from '@/entities/diary-entry';
import type { MealType } from '@/shared/config/meals';
import { AppButton } from '@/shared/ui/button';
import { EntryRow } from '@/entities/diary-entry';
import { useBreakpoints } from '@/shared/lib/breakpoints';
import { AppInput } from '@/shared/ui/input';
import MobileBottomControls from '@/shared/ui/mobile-bottom-controls/MobileBottomControls.vue';

const props = defineProps<{ initialRecipe?: IRecipe; defaultMeal?: MealType }>();
const emit = defineEmits<{ saved: [recipe: IRecipe]; added: [] }>();

const { isMobile, isDesktop } = useBreakpoints();
const diaryStore = useDiaryStore();

const savedRecipe = ref<IRecipe | null>(null);
const productSearchRef = ref<InstanceType<typeof ProductSearch> | null>(null);
const recipeName = ref(props.initialRecipe?.name ?? '');
const ingredients = ref<IRecipeIngredient[]>(
  props.initialRecipe?.ingredients.map((i) => ({ ...i })) ?? [],
);

const totalWeight = computed(() => ingredients.value.reduce((s, i) => s + i.weight, 0));

const per100g = computed(() => {
  const w = totalWeight.value;
  if (w === 0) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
  const calc = (k: keyof Pick<IRecipeIngredient, 'calories' | 'protein' | 'fat' | 'carbs'>) =>
    Math.round((ingredients.value.reduce((s, i) => s + (i[k] * i.weight) / 100, 0) * 100) / w);
  return {
    calories: calc('calories'),
    protein: calc('protein'),
    fat: calc('fat'),
    carbs: calc('carbs'),
  };
});

const addIngredient = (product: IProduct, weight: number) => {
  const idx = ingredients.value.findIndex((i) => i.productId === product.id);
  const ing: IRecipeIngredient = {
    productId: product.id,
    productName: product.name,
    weight,
    calories: product.calories,
    protein: product.protein,
    fat: product.fat,
    carbs: product.carbs,
  };
  if (idx >= 0) ingredients.value[idx] = ing;
  else ingredients.value.push(ing);
  productSearchRef.value?.clearSearch();
};

const removeIngredient = (productId: string) => {
  ingredients.value = ingredients.value.filter((i) => i.productId !== productId);
};

const updateIngredient = ({ productId, weight }: { productId: string; weight: number }) => {
  const ing = ingredients.value.find((i) => i.productId === productId);
  if (ing) ing.weight = weight;
};

const isValid = computed(() => recipeName.value.trim().length > 0 && ingredients.value.length > 0);

const handleSave = () => {
  if (!isValid.value) return;
  const recipe: IRecipe = {
    id: props.initialRecipe?.id ?? `recipe_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: recipeName.value.trim(),
    ingredients: ingredients.value.map((i) => ({ ...i })),
    totalWeight: totalWeight.value,
    ...per100g.value,
  };
  emit('saved', recipe);
  savedRecipe.value = recipe;
};

const handleAddEntry = (weight: number, meal: MealType) => {
  if (!savedRecipe.value) return;
  diaryStore.addEntry(savedRecipe.value, weight, meal);
  emit('added');
  savedRecipe.value = null;
  recipeName.value = '';
  ingredients.value = [];
};

watch(
  [recipeName, ingredients],
  () => {
    savedRecipe.value = null;
  },
  { deep: true },
);
</script>

<template>
  <div class="recipe-form">
    <div class="left-column">
      <div>
        <AppInput v-model="recipeName" placeholder="Название рецепта" class="item-1" />
      </div>
      <div v-if="isDesktop" class="search-wrap">
        <ProductSearch ref="productSearchRef" @select="addIngredient" />
      </div>
    </div>

    <div v-show="isDesktop || ingredients.length > 0" class="right-column">
      <div v-if="ingredients.length > 0" class="ingredient-list">
        <EntryRow
          v-for="ing in ingredients"
          :key="ing.productId"
          :entry="{
            id: ing.productId,
            productId: ing.productId,
            productName: ing.productName,
            weight: ing.weight,
            calories: ing.calories,
            protein: ing.protein,
            fat: ing.fat,
            carbs: ing.carbs,
            date: '',
            mealType: 'breakfast',
          }"
          :mini="isMobile"
        >
          <template #edit-modal="{ isOpen, onClose }">
            <IngredientEditModal
              :model-value="isOpen"
              :ingredient="ing"
              @update:model-value="(v) => !v && onClose()"
              @update="updateIngredient"
              @remove="removeIngredient"
            />
          </template>
        </EntryRow>
      </div>
      <div v-if="ingredients.length > 0" class="totals">
        <span
          >На 100г: <strong>{{ per100g.calories }} ккал</strong></span
        >
        <span
          >Б&thinsp;{{ per100g.protein }} · Ж&thinsp;{{ per100g.fat }} · У&thinsp;{{
            per100g.carbs
          }}</span
        >
        <span class="total-weight">Итого: {{ totalWeight }}&thinsp;г</span>
      </div>
      <AppButton v-if="isDesktop" :disabled="!isValid" class="btn-save" @click="handleSave"
        >Сохранить рецепт</AppButton
      >
      <AddEntryForm
        v-if="isDesktop && savedRecipe"
        :disabled="!savedRecipe"
        :new-product="savedRecipe"
        :default-meal="props.defaultMeal"
        @add-entry="handleAddEntry"
      />
    </div>

    <div v-if="isMobile" class="search-wrap">
      <ProductSearch ref="productSearchRef" @select="addIngredient" />
    </div>
    <MobileBottomControls
      v-if="isMobile"
      :buttons="[{ label: 'Сохранить', event: 'save', disabled: !isValid }]"
      @save="handleSave"
    >
      <template v-if="savedRecipe">
        <AddEntryForm
          :hide-title="true"
          :disabled="false"
          :new-product="savedRecipe"
          :default-meal="props.defaultMeal"
          @add-entry="handleAddEntry"
        />
      </template>
    </MobileBottomControls>
  </div>
</template>

<style scoped>
.recipe-form {
  display: flex;
  gap: 1rem;
}
@media (max-width: 767px) {
  .recipe-form {
    flex: 1;
    overflow: hidden;
    flex-direction: column;
  }
}
.left-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 0;
}
.right-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.search-wrap {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.input {
  appearance: none;
  border: 1px solid rgba(var(--color-gray), 0.7);
  border-radius: var(--border-radius);
  padding: 6px 10px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  font-size: 1rem;
}
.input:focus {
  border-color: rgb(var(--color-gray));
}
.ingredient-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.totals {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(var(--color-darkgreen), 0.06);
  border-radius: var(--border-radius);
  font-size: 0.88rem;
  flex-wrap: wrap;
  gap: 4px;
}
.total-weight {
  color: rgba(var(--color-darkgreen), 0.5);
}
@media (min-width: 768px) {
  .totals {
    margin-top: auto;
  }
  .left-column,
  .right-column {
    flex: 1;
  }
  .ingredient-list {
    display: block;
    border: 1px solid rgba(var(--color-gray), 0.3);
    border-radius: var(--border-radius);
    overflow: hidden;
  }
}
</style>
