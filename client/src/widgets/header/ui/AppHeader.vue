<script setup lang="ts">
import { CalorieBudgetBtn, CalorieBudgetForm } from '@/features/calorie-budget';
import { AppModal } from '@/shared/ui/modal';

const showCalorieBudgetForm = ref(false);
</script>

<template>
  <header class="app-header">
    <RouterLink to="/" class="app-title"><h1>Food Tracker</h1></RouterLink>
    <CalorieBudgetBtn @click="showCalorieBudgetForm = true" />
    <AppModal v-model="showCalorieBudgetForm" title="Set Calorie Budget">
      <CalorieBudgetForm @close="showCalorieBudgetForm = false" />
    </AppModal>
  </header>
</template>

<style scoped>
.app-header {
  height: 112px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--padding);
  background-color: rgb(var(--color-primary));
}
.app-title {
  margin: 0;
  color: white;
  text-decoration: none;
}
</style>
