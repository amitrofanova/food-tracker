<script setup lang="ts">
import { LoginForm, RegisterForm } from '@/entities/user';
import { AppModal } from '@/shared/ui/modal';

const show = defineModel<boolean>({ default: false });
const isLoginMode = ref(true);

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
};

watch(show, (val) => {
  if (val) isLoginMode.value = true;
});

const title = computed(() => (isLoginMode.value ? 'Вход' : 'Регистрация'));
</script>

<template>
  <AppModal v-model="show" :title="title">
    <template v-if="isLoginMode">
      <LoginForm @close="show = false" />
      <div class="btn-wrapper">
        <button class="btn-underline" @click="toggleMode">Зарегистрироваться</button>
      </div>
    </template>
    <template v-else>
      <RegisterForm @close="show = false" />
      <div class="btn-wrapper">
        <button class="btn-underline" @click="toggleMode">Назад</button>
      </div>
    </template>
  </AppModal>
</template>

<style scoped>
.btn-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}
.btn-underline {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 16px;
  text-decoration: underline solid rgb(var(--color-primary));
  text-underline-offset: 4px;
  transition: text-decoration-color 0.3s ease;
}
.btn-underline:hover {
  text-decoration-color: transparent;
}
</style>
