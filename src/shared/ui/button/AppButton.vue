<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: string;
  }>(),
  {
    color: 'rgb(var(--color-secondary))',
  },
);
</script>

<template>
  <button class="btn" :style="{ backgroundColor: color }" @click="$emit('click')">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  appearance: none;
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
  border: none;
  border-radius: var(--border-radius);
  padding: 10px 16px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out 0.1s;
}
.btn:hover {
  opacity: 0.9;
}
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
