<script setup lang="ts">
import { Icon } from '@/shared/ui/icon';
import { useRouter } from 'vue-router';
import { useBreakpoints } from '@/shared/lib/breakpoints';

defineProps<{
  title?: string;
  backLabel?: string;
}>();

const router = useRouter();

const { isMobile } = useBreakpoints();
</script>

<template>
  <div class="page-header">
    <button v-if="isMobile" class="btn-back" @click="router.back()">
      <Icon name="ArrowLeft" />
      {{ backLabel }}
    </button>
    <h1 v-if="title" class="title">{{ title }}</h1>
    <slot />
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}
.title {
  font-size: 1.5rem;
  font-weight: 500;
}
.btn-back {
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgb(var(--color-darkgreen));
  font-size: 0.95rem;
  padding: 4px 2px;
}

.btn-back:hover {
  opacity: 0.7;
}
</style>
