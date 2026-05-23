<script setup lang="ts">
import type { IRecipe } from '../model/types';
import { AppModal } from '@/shared/ui/modal';
import { AppButton } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

defineProps<{
  modelValue: boolean;
  recipe: IRecipe | undefined;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'edit', recipe: IRecipe): void;
  (e: 'delete', id: string): void;
}>();
</script>

<template>
  <AppModal
    :model-value="modelValue"
    :title="recipe?.name"
    @update:model-value="emit('update:modelValue', false)"
  >
    <template v-if="recipe">
      <div class="detail-body">
        <div class="detail-meta">
          <span>{{ recipe.calories }} ккал/100г</span>
          <span
            >Б&thinsp;{{ recipe.protein }} · Ж&thinsp;{{ recipe.fat }} · У&thinsp;{{
              recipe.carbs
            }}</span
          >
          <span class="detail-weight">Рецепт: {{ recipe.totalWeight }}&thinsp;г</span>
        </div>
        <ul class="ingredient-list">
          <li v-for="ing in recipe.ingredients" :key="ing.productId" class="ingredient-item">
            <span class="ingredient-name">{{ ing.productName }}</span>
            <span class="ingredient-weight">{{ ing.weight }}&thinsp;г</span>
          </li>
        </ul>
        <div class="detail-actions">
          <AppButton @click="emit('edit', recipe)">
            <Icon name="Pencil" size="sm" />
            Редактировать
          </AppButton>
          <AppButton color="rgb(var(--color-red))" @click="emit('delete', recipe.id)">
            <Icon name="Trash" size="sm" />
            Удалить
          </AppButton>
        </div>
      </div>
    </template>
  </AppModal>
</template>

<style scoped>
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
</style>
