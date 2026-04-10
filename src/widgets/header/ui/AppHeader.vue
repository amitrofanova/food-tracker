<script setup lang="ts">
import { CalorieBudgetBtn, CalorieBudgetForm } from '@/features/calorie-budget';
import { AppModal } from '@/shared/ui/modal';

const showCalorieBudgetForm = ref(false);
</script>

<template>
  <header class="header">
    <RouterLink to="/" class="title"><h1>Food Tracker</h1></RouterLink>
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
  padding: 0 var(--padding);
  background-color: rgb(var(--color-primary));
}
.title {
  margin: 0;
  line-height: normal;
  color: white;
  text-decoration: none;
}
</style>
