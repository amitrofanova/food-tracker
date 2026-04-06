<script lang="ts" setup>
import { useUserStore } from '@/entities/user/';  
import { storeToRefs } from 'pinia';

const userStore = useUserStore();
const { user } = storeToRefs(userStore)
const calorieBudget = ref();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

watch(user, (newUser) => {
  if (newUser) {
    calorieBudget.value = newUser.calorieBudget.toString();
  }
}, { immediate: true });

const saveBudget = async () => {
    await userStore.setCalorieBudget(calorieBudget.value);
    emit('close');
};
</script>

<template>
  <h1>Daily Food Calorie Budget</h1>
  <input v-model="calorieBudget" type="number" placeholder="Enter your calorie budget" />
  <button @click="saveBudget" class="btn-save">Save</button>
</template>

<style scoped>
h1 {
  margin-bottom: 16px;
  padding-right: 2rem;
  font-size: 24px;
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
  margin-top: 12px;
  margin-left: auto;
  appearance: none;
  border: none;
  border-radius: var(--border-radius);
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
</style
