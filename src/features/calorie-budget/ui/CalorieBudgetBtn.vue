<script lang="ts" setup>
import { useUserStore } from '@/entities/user';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
</script>

<template>
  <button class="calorie-budget-btn">
    <span>Норма калорий</span>
    {{ user?.calorieBudget }} ккал
  </button>
</template>

<style scoped>
.calorie-budget-btn {
  display: flex;
  flex-direction: column;
  align-items: end;
  text-align: end;
  background-color: transparent;
  color: #fff;
  border: none;
  border-radius: var(--border-radius);
  padding: 8px 12px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}
.calorie-budget-btn:hover {
  background-color: rgb(var(--color-secondary), 0.9);
}
</style>
