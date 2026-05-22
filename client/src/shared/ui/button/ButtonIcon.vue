<script setup lang="ts">
import { Icon } from '@/shared/ui/icon';

defineProps<{
  name: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}>();
</script>

<template>
  <button class="btn-icon">
    <Icon :name="name" :size="size" :color="color" />
  </button>
</template>

<style scoped>
.btn-icon {
  appearance: none;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: inherit;
  transition: opacity 0.2s ease-in-out 0.1s;
}
.btn-icon:hover {
  opacity: 0.7;
}
.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
