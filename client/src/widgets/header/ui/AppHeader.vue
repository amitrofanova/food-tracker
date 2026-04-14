<script setup lang="ts">
import { CalorieBudgetBtn, CalorieBudgetForm } from '@/features/calorie-budget';
import { AppModal } from '@/shared/ui/modal';

const showCalorieBudgetForm = ref(false);
</script>

<template>
  <header class="header">
    <RouterLink to="/" class="logo">Food Tracker</RouterLink>
    <CalorieBudgetBtn @click="showCalorieBudgetForm = true" />
    <AppModal v-model="showCalorieBudgetForm">
      <CalorieBudgetForm @close="showCalorieBudgetForm = false" />
    </AppModal>
  </header>
</template>

<style scoped>
.header {
  height: var(--header-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--padding-mobile);
  background-color: rgb(var(--color-primary));
}
.logo {
  margin: 0;
  line-height: normal;
  color: white;
  font-size: 24px;
  font-weight: 700;
  text-decoration: none;
}
@media (min-width: 768px) {
  .header {
    height: var(--header-height);
    padding: 0 var(--padding);
  }
  .logo {
    font-size: 32px;
  }
}
</style>
