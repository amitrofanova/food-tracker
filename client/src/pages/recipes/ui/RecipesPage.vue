<script setup lang="ts">
import type { MealType } from '@/shared/config/meals';
import type { IRecipe } from '@/entities/recipe';
import { RecipeDetailModal } from '@/entities/recipe';
import { useDiaryStore } from '@/entities/diary-entry';
import { AddEntryControls } from '@/entities/diary-entry';
import { AppButton } from '@/shared/ui/button';
import { AppInput } from '@/shared/ui/input';
import { PageHeader } from '@/shared/ui/page-header';
import { Icon } from '@/shared/ui/icon';
import { MealSelect } from '@/shared/ui/select';
import { useBreakpoints } from '@/shared/lib/breakpoints';
import { useRecipes } from '@/features/create-recipe';
import { RecipeFormModal } from '@/widgets/recipe-form';
import { useRouter } from 'vue-router';

const router = useRouter();
const diaryStore = useDiaryStore();
const { recipes, isLoading, save, remove } = useRecipes();
const { isMobile, isDesktop } = useBreakpoints();

const showForm = ref(false);
const editingRecipe = ref<IRecipe | undefined>(undefined);
const selectedMeal = ref<MealType>('breakfast');
const viewedRecipe = ref<IRecipe | undefined>(undefined);
const searchQuery = ref('');

const filteredRecipes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return recipes.value;
  return recipes.value.filter((r) => r.name.toLowerCase().includes(q));
});

const formTitle = computed(() => (editingRecipe.value ? 'Редактировать рецепт' : 'Новый рецепт'));

const addToDiary = (recipe: IRecipe, weight: number) => {
  diaryStore.addEntry(recipe, weight, selectedMeal.value);
};

const openDetail = (recipe: IRecipe) => {
  if (isMobile.value) {
    router.push({ name: 'recipe-detail', params: { id: recipe.id } });
  } else {
    viewedRecipe.value = recipe;
  }
};

const edit = (recipe: IRecipe) => {
  viewedRecipe.value = undefined;
  editingRecipe.value = recipe;
  showForm.value = true;
};

const deleteRecipe = async (id: string) => {
  await remove(id);
  viewedRecipe.value = undefined;
};

const onSaved = async (recipe: IRecipe) => {
  await save(recipe);
  editingRecipe.value = undefined;
};
</script>

<template>
  <PageHeader title="Мои рецепты" />

  <div class="panel-header">
    <MealSelect v-model="selectedMeal" />
    <AppButton class="btn-new" @click="showForm = true">
      <Icon name="PlusSymbol" size="sm" />
      Новый рецепт
    </AppButton>
  </div>
  <AppInput v-model="searchQuery" placeholder="Поиск рецептов…" class="search-input" />

  <p v-if="isLoading" class="empty">Загрузка…</p>
  <p v-else-if="recipes.length === 0" class="empty">Нет сохранённых рецептов</p>
  <p v-else-if="filteredRecipes.length === 0" class="empty">Ничего не найдено</p>

  <ul v-else class="recipe-list">
    <li
      v-for="recipe in filteredRecipes"
      :key="recipe.id"
      class="recipe-item"
      @click="openDetail(recipe)"
    >
      <div class="recipe-info">
        <span class="recipe-name">{{ recipe.name }}</span>
        <span class="recipe-meta">
          {{ recipe.calories }} ккал/100г
          <span v-if="isDesktop">
            &middot; Б&thinsp;{{ recipe.protein }} · Ж&thinsp;{{ recipe.fat }} · У&thinsp;{{
              recipe.carbs
            }}</span
          >
        </span>
        <span v-if="isDesktop" class="recipe-weight-hint"
          >Рецепт: {{ recipe.totalWeight }}&thinsp;г</span
        >
      </div>
      <div class="recipe-controls" @click.stop>
        <AddEntryControls :disabled="false" @add-entry="(w) => addToDiary(recipe, w)" />
      </div>
    </li>
  </ul>

  <RecipeFormModal
    v-model="showForm"
    :title="formTitle"
    :initial-recipe="editingRecipe"
    :default-meal="selectedMeal"
    @saved="onSaved"
    @added="showForm = false"
    @closed="editingRecipe = undefined"
  />

  <RecipeDetailModal
    v-if="isDesktop"
    :model-value="!!viewedRecipe"
    :recipe="viewedRecipe"
    @update:model-value="viewedRecipe = undefined"
    @edit="edit"
    @delete="deleteRecipe"
  />
</template>

<style scoped>
.panel-header {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.btn-new {
  margin-left: auto;
}
.search-input {
  margin-bottom: 1rem;
}
.empty {
  text-align: center;
  color: rgba(var(--color-darkgreen), 0.4);
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
  cursor: pointer;
  transition: background-color 0.15s;
}
.recipe-item:hover {
  background-color: rgba(var(--color-gray), 0.1);
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
  color: rgba(var(--color-darkgreen), 0.9);
}
.recipe-weight-hint {
  font-size: 0.75rem;
  color: rgba(var(--color-darkgreen), 0.6);
}
.recipe-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
@media (min-width: 768px) {
  .page {
    padding: var(--padding);
    max-width: 700px;
    margin: 0 auto;
    min-width: 480px;
  }
  .recipe-item {
    padding: 0.75rem 1rem;
    border: 1px solid rgb(var(--color-gray));
    border-radius: var(--border-radius);
  }
}
@media (max-width: 767px) {
  .recipe-item:nth-child(even) {
    background-color: rgba(var(--color-gray), 0.06);
  }
  .recipe-item {
    margin: 0 -1rem;
    padding: 0.5rem 1rem;
  }
}
</style>
