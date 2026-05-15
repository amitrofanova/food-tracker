<script setup lang="ts">
import type { MealType } from '@/shared/config/meals';
import type { IRecipe } from '@/entities/recipe';
import { useDiaryStore } from '@/entities/diary-entry';
import { AddEntryControls } from '@/entities/diary-entry';
import { AppModal } from '@/shared/ui/modal';
import { Icon } from '@/shared/ui/icon';
import { MealSelect } from '@/shared/ui/select';
import { PageHeader } from '@/shared/ui/page-header';
import { useRecipes } from '@/features/create-recipe';
import { RecipeForm } from '@/widgets/recipe-form';
import { MobileBottomControls } from '@/shared/ui/mobile-bottom-controls';
import { useBreakpoints } from '@/shared/lib/breakpoints';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const diaryStore = useDiaryStore();
const { recipes, isLoading, save, remove } = useRecipes();

const selectedMeal = ref<MealType>('breakfast');
const showEditForm = ref(false);
const { isMobile } = useBreakpoints();

const recipe = computed<IRecipe | undefined>(() =>
  recipes.value.find((r) => r.id === route.params.id),
);

const addToDiary = (weight: number) => {
  if (!recipe.value) return;
  diaryStore.addEntry(recipe.value, weight, selectedMeal.value);
};

const onSaved = async (updated: IRecipe) => {
  await save(updated);
  showEditForm.value = false;
};

const deleteRecipe = async () => {
  if (!recipe.value) return;
  await remove(recipe.value.id);
  router.back();
};
</script>

<template>
  <div class="page">
    <PageHeader back-label="К рецептам" />

    <p v-if="isLoading" class="empty">Загрузка…</p>
    <p v-else-if="!recipe" class="empty">Рецепт не найден</p>

    <template v-else>
      <h1 class="recipe-name">{{ recipe.name }}</h1>

      <div class="meta">
        <span
          ><strong>{{ recipe.calories }}</strong> ккал/100г</span
        >
        <span
          >Б&thinsp;{{ recipe.protein }} · Ж&thinsp;{{ recipe.fat }} · У&thinsp;{{
            recipe.carbs
          }}</span
        >
        <span class="meta-weight">Рецепт: {{ recipe.totalWeight }}&thinsp;г</span>
      </div>

      <ul class="ingredient-list">
        <li v-for="ing in recipe.ingredients" :key="ing.productId" class="ingredient-item">
          <span class="ingredient-name">{{ ing.productName }}</span>
          <span class="ingredient-weight">{{ ing.weight }}&thinsp;г</span>
        </li>
      </ul>

      <div class="add-section">
        <MealSelect v-model="selectedMeal" />
        <AddEntryControls :disabled="false" @add-entry="addToDiary" />
      </div>

      <div v-if="!isMobile" class="actions">
        <button class="btn-edit" @click="showEditForm = true">
          <Icon name="Pencil" size="sm" />
          Редактировать
        </button>
        <button class="btn-delete" @click="deleteRecipe">
          <Icon name="Trash" size="sm" />
          Удалить
        </button>
      </div>

      <MobileBottomControls
        v-if="isMobile"
        :buttons="[
          { label: 'Редактировать', event: 'edit', color: 'rgb(var(--color-secondary))' },
          { label: 'Удалить', event: 'delete', color: 'rgb(var(--color-red))' },
        ]"
        @edit="showEditForm = true"
        @delete="deleteRecipe"
      />
    </template>

    <AppModal
      v-model="showEditForm"
      title="Редактировать рецепт"
      width="1000px"
      @closed="showEditForm = false"
    >
      <RecipeForm
        :initial-recipe="recipe"
        @saved="onSaved"
        @cancel="showEditForm = false"
        style="overflow: hidden; height: 700px"
      />
    </AppModal>
  </div>
</template>

<style scoped>
.page {
  padding: var(--padding-mobile);
  padding-bottom: calc(var(--padding-mobile) + 70px);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recipe-name {
  margin: 0;
  font-size: 1.4rem;
  color: rgb(var(--color-primary));
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.88rem;
  color: rgba(var(--color-primary), 0.7);
}

.meta-weight {
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
  padding: 8px 12px;
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

.add-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.actions {
  display: flex;
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
  padding: 8px 14px;
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
  padding: 8px 14px;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  transition: background-color 0.15s;
}

.btn-delete:hover {
  background-color: rgba(var(--color-red), 0.08);
}

.empty {
  text-align: center;
  color: rgba(var(--color-primary), 0.4);
  padding: 2rem 0;
}
</style>
