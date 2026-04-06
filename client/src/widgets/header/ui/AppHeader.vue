<script setup lang="ts">
import { CalorieBudgetBtn, CalorieBudgetForm } from '@/features/calorie-budget';
import { AppModal } from '@/shared/ui/modal';

const showCalorieBudgetForm = ref(false);
</script>

<template>
  <header class="app-header">
    <h1 class="app-title">Food Tracker</h1>
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
  color: white;
}
.app-title {
  margin: 0;
}
</style>
