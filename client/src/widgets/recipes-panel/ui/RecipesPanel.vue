<script setup lang="ts">
import type { MealType } from '@/shared/config/meals';
import type { IRecipe } from '@/entities/recipe';
import { useDiaryStore } from '@/entities/diary-entry';
import { AddEntryControls } from '@/entities/diary-entry';
import { AppButton } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { MealSelect } from '@/shared/ui/select';
import { useRecipes } from '@/features/create-recipe';
import RecipeForm from './RecipeForm.vue';

const props = defineProps<{ mealType?: MealType }>();

const diaryStore = useDiaryStore();
const { recipes, isLoading, save, remove } = useRecipes();

const showForm = ref(false);
const localMeal = ref<MealType>('breakfast');

const activeMeal = computed(() => props.mealType ?? localMeal.value);

const addToDiary = (recipe: IRecipe, weight: number) => {
  diaryStore.addEntry(recipe, weight, activeMeal.value);
};

const onSaved = async (recipe: IRecipe) => {
  await save(recipe);
  showForm.value = false;
};
</script>

<template>
  <div class="panel">
    <template v-if="!showForm">
      <div class="panel-header">
        <MealSelect v-if="!mealType" v-model="localMeal" />
        <AppButton class="btn-new" @click="showForm = true">
          <Icon name="PlusSymbol" size="sm" />
          Новый рецепт
        </AppButton>
      </div>

      <p v-if="isLoading" class="empty">Загрузка…</p>
      <p v-else-if="recipes.length === 0" class="empty">Нет сохранённых рецептов</p>

      <ul v-else class="recipe-list">
        <li v-for="recipe in recipes" :key="recipe.id" class="recipe-item">
          <div class="recipe-info">
            <span class="recipe-name">{{ recipe.name }}</span>
            <span class="recipe-meta">
              {{ recipe.calories }} ккал/100г &middot; Б&thinsp;{{ recipe.protein }} · Ж&thinsp;{{
                recipe.fat
              }}
              · У&thinsp;{{ recipe.carbs }}
            </span>
            <span class="recipe-weight-hint">Рецепт: {{ recipe.totalWeight }}&thinsp;г</span>
          </div>
          <div class="recipe-controls">
            <AddEntryControls :disabled="false" @add-entry="(w) => addToDiary(recipe, w)" />
            <button class="btn-delete" aria-label="Удалить рецепт" @click="remove(recipe.id)">
              <Icon name="Trash" size="sm" />
            </button>
          </div>
        </li>
      </ul>
    </template>

    <template v-else>
      <div class="form-header">
        <button class="btn-back" @click="showForm = false">
          <Icon name="ArrowLeft" />
          К рецептам
        </button>
      </div>
      <RecipeForm @saved="onSaved" />
    </template>
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-new {
  margin-left: auto;
}

.empty {
  text-align: center;
  color: rgba(var(--color-primary), 0.4);
  padding: 2rem 0;
}

.recipe-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recipe-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(var(--color-secondary), 0.4);
  border-radius: var(--border-radius);
}

.recipe-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.recipe-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recipe-meta {
  font-size: 0.78rem;
  color: rgba(var(--color-primary), 0.55);
}

.recipe-weight-hint {
  font-size: 0.75rem;
  color: rgba(var(--color-primary), 0.4);
}

.recipe-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-delete {
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
  color: rgb(var(--color-red));
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: var(--border-radius);
}

.btn-delete:hover {
  background-color: rgba(var(--color-red), 0.1);
}

.form-header {
  margin-bottom: -0.25rem;
}

.btn-back {
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgb(var(--color-primary));
  font-size: 0.95rem;
  padding: 4px 2px;
}

.btn-back:hover {
  opacity: 0.7;
}

@media (min-width: 768px) {
  .panel {
    min-width: 480px;
  }
}
</style>
