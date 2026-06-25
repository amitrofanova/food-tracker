<script lang="ts" setup>
import { useUserStore } from '@/entities/user/';  
import { AppButton } from '@/shared/ui/button';
import { AppInput } from '@/shared/ui/input';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';

const userStore = useUserStore();
const { user } = storeToRefs(userStore)
const calorieBudget = ref(user.value?.calorieBudget);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const saveBudget = async () => {
    await userStore.setCalorieBudget(Number(calorieBudget.value) || 0);
    emit('close');
};
</script>

<template>
  <h1>Суточная норма калорий</h1>
  <form @submit.prevent="saveBudget" class="form">
    <AppInput v-model="calorieBudget" type="number" placeholder="Enter your calorie budget" />
    <AppButton type="submit">Сохранить</AppButton>
  </form>
  <RouterLink to="/calorie-calculator" class="link">Рассчитать норму калорий</RouterLink>
</template>

<style scoped>
h1 {
  margin-bottom: 16px;
  padding-right: 2rem;
  font-size: 24px;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.link {
  display: block;
  margin-top: 12px;
  text-align: center;
  color: rgb(var(--color-darkgreen))
}
</style
