<script setup lang="ts">
import { Icon } from '@/shared/ui/icon';
import DiaryEntryEditModal from './DiaryEntryEditModal.vue';
import type { IDiaryEntry } from '../model/types';
import type { MealType } from '@/shared/config/meals';

defineProps<{ entry: IDiaryEntry; compact?: boolean; mini?: boolean }>();
const emit = defineEmits<{
  (e: 'remove', id: string): void;
  (e: 'update', payload: { id: string; weight: number; mealType: MealType }): void;
}>();

const isOpen = ref(false);
</script>

<template>
  <div v-if="mini" class="entry-chip">
    <span class="name">{{ entry.productName }}</span>
    <span class="weight">{{ entry.weight }} г</span>
    <button @click="isOpen = true" class="edit-btn">
      <Icon name="Pencil" size="sm" />
    </button>
  </div>
  <div v-else class="entry-row" :class="{ compact: compact }">
    <div class="info-wrap">
      <span class="name">{{ entry.productName }}</span>
      <div class="data-wrap">
        <span class="weight">{{ entry.weight }} г</span>
        <span class="calories">{{ entry.calories }} ккал</span>
        <span class="macros">Б:{{ entry.protein }} Ж:{{ entry.fat }} У:{{ entry.carbs }}</span>
      </div>
    </div>
    <button @click="isOpen = true" class="edit-btn">
      <Icon name="Pencil" size="sm" />
    </button>
  </div>
  <slot name="edit-modal" :is-open="isOpen" :on-close="() => (isOpen = false)">
    <DiaryEntryEditModal
      v-model="isOpen"
      :entry="entry"
      @update="emit('update', $event)"
      @remove="emit('remove', $event)"
    />
  </slot>
</template>

<style scoped>
.entry-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 0.9rem;
}
.entry-row:nth-child(even) {
  background-color: #edf1f3;
}
.entry-row:nth-child(odd) {
  background-color: #f9f9f9;
}
.compact {
  justify-content: space-between;
  gap: 8px;
  padding: 4px 8px;
}
.info-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.data-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}
.name {
  flex: 2;
}
.weight {
  flex: 1;
}
.calories {
  flex: 1;
  font-weight: 700;
  font-size: 0.8rem;
}
.macros {
  flex: 2;
}
.edit-btn {
  background: none;
  border: none;
  cursor: pointer;
}
.edit-btn:hover {
  color: rgb(var(--color-darkgreen));
}
.entry-chip .edit-btn {
  flex: 0 0 auto;
}
.entry-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: calc(50% - 4px);
  min-width: 0;
  padding: 2px 4px;
  font-size: 0.75rem;
  border-radius: var(--border-radius);
  border: 1px solid rgba(var(--color-darkgreen), 0.3);
  background: rgba(var(--color-darkgreen), 0.07);
  gap: 4px;
}
.entry-chip .name {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.entry-chip .weight {
  flex: 0 0 auto;
  color: var(--color-text-secondary);
}
</style>
