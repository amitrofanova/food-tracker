<script setup lang="ts">
import { Icon } from '@/shared/ui/icon';
import { useRouter } from 'vue-router';

defineProps<{
  backLabel?: string;
}>();

const router = useRouter();
</script>

<template>
  <div class="page-header">
    <button class="btn-back" @click="router.back()">
      <Icon name="ArrowLeft" />
      {{ backLabel ?? 'Назад' }}
    </button>
    <slot />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
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
</style>
