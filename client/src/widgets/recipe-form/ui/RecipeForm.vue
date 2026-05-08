<script setup lang="ts">
import type { IProduct } from '@/entities/product';
import type { IRecipe, IRecipeIngredient } from '@/entities/recipe';
import { ProductSearch } from '@/features/product-search';
import { AppButton } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

const props = defineProps<{ initialRecipe?: IRecipe }>();
const emit = defineEmits<{ saved: [recipe: IRecipe] }>();

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
};

const removeIngredient = (productId: string) => {
  ingredients.value = ingredients.value.filter((i) => i.productId !== productId);
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
  recipeName.value = '';
  ingredients.value = [];
};
</script>

<template>
  <div class="recipe-form">
    <div class="left-column">
      <div>
        <input
          v-model="recipeName"
          name="recipeName"
          class="input item-1"
          placeholder="Название рецепта"
          aria-label="Название рецепта"
        />
      </div>
      <div class="search-wrap item-2">
        <ProductSearch @select="addIngredient" />
      </div>
    </div>

    <div class="right-column">
      <ul v-if="ingredients.length > 0" class="ingredient-list">
        <li v-for="ing in ingredients" :key="ing.productId" class="ingredient-item">
          <span class="ingredient-name">{{ ing.productName }}</span>
          <span class="ingredient-weight">{{ ing.weight }}&thinsp;г</span>
          <button
            class="btn-remove"
            aria-label="Удалить ингредиент"
            @click="removeIngredient(ing.productId)"
          >
            <Icon name="Close" size="sm" />
          </button>
        </li>
      </ul>
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

      <AppButton :disabled="!isValid" class="btn-save" @click="handleSave"
        >Сохранить рецепт</AppButton
      >
    </div>
  </div>
</template>

<style scoped>
.recipe-form {
  display: flex;
  gap: 1rem;
}
@media (max-width: 767px) {
  .recipe-form {
    flex-direction: column;
  }
}
.left-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.right-column {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}
.search-wrap {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.input {
  appearance: none;
  border: 1px solid rgba(var(--color-secondary), 0.7);
  border-radius: var(--border-radius);
  padding: 6px 10px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  font-size: 1rem;
  background: rgba(var(--color-background), 0.8);
}
.input:focus {
  border-color: rgb(var(--color-secondary));
}
.ingredient-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid rgba(var(--color-secondary), 0.3);
  border-radius: var(--border-radius);
  overflow: hidden;
}
.ingredient-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
}
.ingredient-item:nth-child(even) {
  background-color: rgba(var(--color-secondary), 0.08);
}
.ingredient-name {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
}
.ingredient-weight {
  color: rgba(var(--color-primary), 0.55);
  font-size: 0.85rem;
  flex-shrink: 0;
}
.btn-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: rgb(var(--color-red));
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: 4px;
  flex-shrink: 0;
}
.btn-remove:hover {
  background-color: rgba(var(--color-red), 0.1);
}
.totals {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(var(--color-primary), 0.06);
  border-radius: var(--border-radius);
  font-size: 0.88rem;
  flex-wrap: wrap;
  gap: 4px;
}
.total-weight {
  color: rgba(var(--color-primary), 0.5);
}
</style>
