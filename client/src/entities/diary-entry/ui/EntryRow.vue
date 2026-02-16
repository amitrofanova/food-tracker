<script setup lang="ts">
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
    <button @click="onRemove" class="remove-btn">✕</button>
  </div>
</template>

<style scoped>
.entry-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
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
  color: #999;
}
.remove-btn:hover {
  color: #f00;
}
</style>
