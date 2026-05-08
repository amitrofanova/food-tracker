<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Icon } from '@/shared/ui/icon';
import { RecipesPanel } from '@/widgets/recipes-panel';

const router = useRouter();
</script>

<template>
  <div class="page">
    <div class="page-header">
      <button class="btn-back" aria-label="Назад" @click="router.back()">
        <Icon name="ArrowLeft" />
      </button>
      <h1 class="title">Рецепты</h1>
    </div>
    <RecipesPanel />
  </div>
</template>

<style scoped>
.page {
  padding: var(--padding-mobile);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.title {
  flex: 1;
  margin: 0;
  font-size: 1.5rem;
  color: rgb(var(--color-primary));
}

.btn-back {
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  color: rgb(var(--color-primary));
}

@media (min-width: 768px) {
  .page {
    padding: var(--padding);
    max-width: 700px;
    margin: 0 auto;
  }
}
</style>
