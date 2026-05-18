<script setup lang="ts">
import { Icon } from '@/shared/ui/icon';
import type { IDiaryEntry } from '../model/types';

const props = defineProps<{ entry: IDiaryEntry; compact?: boolean }>();
const emit = defineEmits<{ (e: 'remove', id: string): void }>();

const onRemove = () => emit('remove', props.entry.id);
</script>

<template>
  <div class="entry-row" :class="{ compact: props.compact }">
    <div class="info-wrap">
      <span class="name">{{ entry.productName }}</span>
      <div class="data-wrap">
        <span class="weight">{{ entry.weight }} г</span>
        <span class="calories">{{ entry.calories }} ккал</span>
        <span class="macros">Б:{{ entry.protein }} Ж:{{ entry.fat }} У:{{ entry.carbs }}</span>
      </div>
    </div>
    <button @click="onRemove" class="remove-btn">
      <Icon name="Close" size="sm" />
    </button>
  </div>
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
.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
}
.remove-btn:hover {
  color: rgb(var(--color-red));
}
</style>
