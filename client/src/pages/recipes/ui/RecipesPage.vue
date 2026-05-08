<script setup lang="ts">
import type { MealType } from '@/shared/config/meals';
import type { IRecipe } from '@/entities/recipe';
import { useDiaryStore } from '@/entities/diary-entry';
import { AddEntryControls } from '@/entities/diary-entry';
import { AppButton } from '@/shared/ui/button';
import { AppModal } from '@/shared/ui/modal';
import { Icon } from '@/shared/ui/icon';
import { MealSelect } from '@/shared/ui/select';
import { useBreakpoints } from '@/shared/lib/breakpoints';
import { useRecipes } from '@/features/create-recipe';
import { RecipeForm } from '@/widgets/recipe-form';

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
  viewedRecipe.value = recipe;
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
  showForm.value = false;
  editingRecipe.value = undefined;
};
</script>

<template>
  <div class="page">
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
              <button class="btn-edit" @click="edit(viewedRecipe)">
                <Icon name="Pencil" size="sm" />
                Редактировать
              </button>
              <button class="btn-delete" @click="deleteRecipe(viewedRecipe.id)">
                <Icon name="Trash" size="sm" />
                Удалить
              </button>
            </div>
          </div>
        </template>
      </AppModal>
    </template>

    <!-- Mobile: inline form replaces list -->
    <template v-else>
      <template v-if="!showForm">
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
          :model-value="!!viewedRecipe"
          :title="viewedRecipe?.name"
          @update:model-value="viewedRecipe = undefined"
        >
          <template v-if="viewedRecipe">
            <div class="detail-body">
              <div class="detail-meta">
                <span>{{ viewedRecipe.calories }} ккал/100г</span>
                <span
                  >Б&thinsp;{{ viewedRecipe.protein }} · Ж&thinsp;{{ viewedRecipe.fat }} ·
                  У&thinsp;{{ viewedRecipe.carbs }}</span
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
                <button class="btn-edit" @click="edit(viewedRecipe)">
                  <Icon name="Pencil" size="sm" />
                  Редактировать
                </button>
                <button class="btn-delete" @click="deleteRecipe(viewedRecipe.id)">
                  <Icon name="Trash" size="sm" />
                  Удалить
                </button>
              </div>
            </div>
          </template>
        </AppModal>
      </template>

      <template v-else>
        <div class="form-header">
          <button
            class="btn-back"
            @click="
              showForm = false;
              editingRecipe = undefined;
            "
          >
            <Icon name="ArrowLeft" />
            К рецептам
          </button>
        </div>
        <RecipeForm :initial-recipe="editingRecipe" @saved="onSaved" />
      </template>
    </template>
  </div>
</template>

<style scoped>
.page {
  padding: var(--padding-mobile);
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
  cursor: pointer;
  transition: background-color 0.15s;
}

.recipe-item:hover {
  background-color: rgba(var(--color-secondary), 0.07);
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
  color: rgba(var(--color-primary), 0.7);
}

.detail-weight {
  color: rgba(var(--color-primary), 0.45);
  font-size: 0.8rem;
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
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  font-size: 0.9rem;
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
}

.ingredient-weight {
  color: rgba(var(--color-primary), 0.55);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.detail-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.25rem;
}

.btn-edit {
  appearance: none;
  border: 1px solid rgba(var(--color-secondary), 0.6);
  background: transparent;
  cursor: pointer;
  color: rgb(var(--color-primary));
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  transition: background-color 0.15s;
}

.btn-edit:hover {
  background-color: rgba(var(--color-secondary), 0.1);
}

.btn-delete {
  appearance: none;
  border: 1px solid rgba(var(--color-red), 0.5);
  background: transparent;
  cursor: pointer;
  color: rgb(var(--color-red));
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  transition: background-color 0.15s;
}

.btn-delete:hover {
  background-color: rgba(var(--color-red), 0.08);
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
  .page {
    padding: var(--padding);
    max-width: 700px;
    margin: 0 auto;
    min-width: 480px;
  }
}
</style>
