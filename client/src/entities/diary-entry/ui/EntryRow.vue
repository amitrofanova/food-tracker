<script setup lang="ts">
import { Icon } from '@/shared/ui/icon';
import type { IDiaryEntry } from '../model/types';

const props = defineProps<{ entry: IDiaryEntry }>();
const emit = defineEmits<{ (e: 'remove', id: string): void }>();

const onRemove = () => emit('remove', props.entry.id);
</script>

<template>
  <div class="entry-row">
    <span class="name">{{ entry.productName }}</span>
    <span class="weight">{{ entry.weight }} г</span>
    <span class="calories">{{ entry.calories }} ккал</span>
    <span class="macros">Б:{{ entry.protein }} Ж:{{ entry.fat }} У:{{ entry.carbs }}</span>
    <button @click="onRemove" class="remove-btn">
      <Icon name="Close" size="sm" />
    </button>
  </div>
</template>

<style scoped>
.entry-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
}
.entry-row:nth-child(even) {
  background-color: #edf1f3;
}
.entry-row:nth-child(odd) {
  background-color: #f9f9f9;
}
.name {
  flex: 2;
}
.weight {
  flex: 1;
}
.calories {
  flex: 1;
}
.macros {
  flex: 2;
}
.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
}
.remove-btn:hover {
  color: rgb(var(--color-red));
}
</style>
