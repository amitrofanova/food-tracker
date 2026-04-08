<script lang="ts" setup>
import { useUserStore } from '@/entities/user/';  
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
  <h1>Daily Food Calorie Budget</h1>
  <form @submit.prevent="saveBudget" class="form">
    <input v-model="calorieBudget" inputmode="numeric" pattern="[0-9]*" placeholder="Enter your calorie budget" />
    <button type="submit" class="btn-save">Save</button>
  </form>
  <RouterLink to="/calorie-calculator" class="link">Calculate your calorie needs</RouterLink>
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
input {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border-radius: var(--border-radius);
  border: 1px solid rgba(var(--color-secondary), 0.5);
}
input:focus {
  outline: none;
  border-color: rgb(var(--color-secondary));
  box-shadow: 0 0 0 2px rgba(var(--color-secondary), 0.2);
}
.btn-save {
  appearance: none;
  border: none;
  border-radius: var(--border-radius);
  padding: 10px 16px;
  background-color: rgb(var(--color-secondary));
  color: #fff;
  font-weight: bold;
  transition: opacity 0.2s ease-in-out 0.1s;
}
.btn-save:hover {
  opacity: 0.9;
}
@media (max-width: 767px) {
  .btn-save {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    width: 36px;
    height: 36px;    font-size: 28px;
    line-height: 28px;
  }
}
.link {
  display: block;
  margin-top: 12px;
  text-align: center;
  color: rgb(--var(--color-primary))
}
</style
