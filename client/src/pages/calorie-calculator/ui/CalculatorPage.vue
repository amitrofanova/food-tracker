<script setup lang="ts">
import { useUserStore } from '@/entities/user/';
import { CalorieCalculator } from '@/features/calorie-budget';
import { AppButton } from '@/shared/ui/button';

const userStore = useUserStore();

const caloriesBudget = ref(0);
const saveBtnDiabled = ref(true);

const onCalculated = (result: number) => {
  caloriesBudget.value = result;
  saveBtnDiabled.value = false;
};

const save = async () => {
  await userStore.setCalorieBudget(caloriesBudget.value);
};
</script>

<template>
  <div class="wrapper">
    <h1>Подберите суточную норму калорий</h1>
    <CalorieCalculator @calculated="onCalculated" />
    <AppButton color="rgb(var(--color-primary))" :disabled="saveBtnDiabled" @click="save"
      >Сохранить</AppButton
    >
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding-bottom: 100px;
}
h1 {
  text-align: center;
  font-size: 24px;
}
.btn-save {
  border: none;
  border-radius: var(--border-radius);
  padding: 12px;
  background-color: rgb(var(--color-primary));
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out 0.1s;
}
.btn-save:hover {
  opacity: 0.9;
}
</style>
