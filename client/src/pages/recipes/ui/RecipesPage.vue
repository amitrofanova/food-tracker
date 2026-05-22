<script setup lang="ts">
import type { MealType } from '@/shared/config/meals';
import type { IRecipe } from '@/entities/recipe';
import { useDiaryStore } from '@/entities/diary-entry';
import { AddEntryControls } from '@/entities/diary-entry';
import { AppButton } from '@/shared/ui/button';
import { PageHeader } from '@/shared/ui/page-header';
import { AppModal } from '@/shared/ui/modal';
import { Icon } from '@/shared/ui/icon';
import { MealSelect } from '@/shared/ui/select';
import { useBreakpoints } from '@/shared/lib/breakpoints';
import { useRecipes } from '@/features/create-recipe';
import { RecipeForm } from '@/widgets/recipe-form';
import { useRouter } from 'vue-router';

const router = useRouter();
const diaryStore = useDiaryStore();
const { recipes, isLoading, save, remove } = useRecipes();
const { isMobile } = useBreakpoints();

const showForm = ref(false);
const editingRecipe = ref<IRecipe | undefined>(undefined);
const selectedMeal = ref<MealType>('breakfast');
const viewedRecipe = ref<IRecipe | undefined>(undefined);

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
  if (editingRecipe.value) {
    showForm.value = false;
    editingRecipe.value = undefined;
  }
};
</script>

<template>
  <PageHeader title="Мои рецепты" />

  <template v-if="!isMobile">
    <div class="panel-header">
      <MealSelect v-model="selectedMeal" />
      <AppButton class="btn-new" @click="showForm = true">
        <Icon name="PlusSymbol" size="sm" />
        Новый рецепт
      </AppButton>
    </div>

    <p v-if="isLoading" class="empty">Загрузка…</p>
    <p v-else-if="recipes.length === 0" class="empty">Нет сохранённых рецептов</p>

    <ul v-else class="recipe-list">
      <li
        v-for="recipe in recipes"
        :key="recipe.id"
        class="recipe-item"
        @click="openDetail(recipe)"
      >
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
        <div class="recipe-controls" @click.stop>
          <AddEntryControls :disabled="false" @add-entry="(w) => addToDiary(recipe, w)" />
        </div>
      </li>
    </ul>

    <AppModal
      v-model="showForm"
      :title="formTitle"
      width="1000px"
      @closed="editingRecipe = undefined"
    >
      <RecipeForm
        :initial-recipe="editingRecipe"
        @saved="onSaved"
        @added="
          showForm = false;
          editingRecipe = undefined;
        "
        style="overflow: hidden; height: 700px"
      />
    </AppModal>

    <AppModal
      :model-value="!!viewedRecipe"
      :title="viewedRecipe?.name"
      @update:model-value="viewedRecipe = undefined"
    >
      <template v-if="viewedRecipe">
        <div class="detail-body">
          <div class="detail-meta">
            <span>{{ viewedRecipe.calories }} ккал/100г</span>
            <span
              >Б&thinsp;{{ viewedRecipe.protein }} · Ж&thinsp;{{ viewedRecipe.fat }} · У&thinsp;{{
                viewedRecipe.carbs
              }}</span
            >
            <span class="detail-weight">Рецепт: {{ viewedRecipe.totalWeight }}&thinsp;г</span>
          </div>
          <ul class="ingredient-list">
            <li
              v-for="ing in viewedRecipe.ingredients"
              :key="ing.productId"
              class="ingredient-item"
            >
              <span class="ingredient-name">{{ ing.productName }}</span>
              <span class="ingredient-weight">{{ ing.weight }}&thinsp;г</span>
            </li>
          </ul>
          <div class="detail-actions">
            <AppButton @click="edit(viewedRecipe)">
              <Icon name="Pencil" size="sm" />
              Редактировать
            </AppButton>
            <AppButton color="rgb(var(--color-red))" @click="deleteRecipe(viewedRecipe.id)">
              <Icon name="Trash" size="sm" />
              Удалить
            </AppButton>
          </div>
        </div>
      </template>
    </AppModal>
  </template>

  <!-- Mobile -->
  <template v-else>
    <div class="panel-header">
      <MealSelect v-model="selectedMeal" />
      <AppButton class="btn-new" @click="showForm = true">
        <Icon name="PlusSymbol" size="sm" />
        Новый рецепт
      </AppButton>
    </div>

    <p v-if="isLoading" class="empty">Загрузка…</p>
    <p v-else-if="recipes.length === 0" class="empty">Нет сохранённых рецептов</p>

    <ul v-else class="recipe-list">
      <li
        v-for="recipe in recipes"
        :key="recipe.id"
        class="recipe-item"
        @click="openDetail(recipe)"
      >
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
        <div class="recipe-controls" @click.stop>
          <AddEntryControls :disabled="false" @add-entry="(w) => addToDiary(recipe, w)" />
        </div>
      </li>
    </ul>

    <AppModal
      v-model="showForm"
      :title="formTitle"
      width="1000px"
      @closed="editingRecipe = undefined"
    >
      <RecipeForm
        :initial-recipe="editingRecipe"
        :default-meal="selectedMeal"
        @saved="onSaved"
        @added="
          showForm = false;
          editingRecipe = undefined;
        "
        style="overflow: hidden; height: 700px"
      />
    </AppModal>
  </template>
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
  padding: 0.75rem 1rem;
  border: 1px solid rgb(var(--color-gray));
  border-radius: var(--border-radius);
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

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 280px;
}

.detail-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.88rem;
  color: rgb(var(--text-primary));
}

.detail-weight {
  color: rgba(var(--text-primary), 0.45);
  font-size: 0.8rem;
}

.ingredient-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid rgba(var(--color-gray), 0.3);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.ingredient-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  font-size: 0.9rem;
}

.ingredient-item:nth-child(even) {
  background-color: rgba(var(--bg-secondary), 0.08);
}

.ingredient-name {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ingredient-weight {
  color: rgba(var(--color-darkgreen), 0.55);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.detail-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 0.25rem;
}
.detail-actions button {
  flex: 1;
}
@media (min-width: 768px) {
  .page {
    padding: var(--padding);
    max-width: 700px;
    margin: 0 auto;
    min-width: 480px;
  }
}
</style>
