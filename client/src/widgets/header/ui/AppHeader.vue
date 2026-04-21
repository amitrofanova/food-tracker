<script setup lang="ts">
import LoginForm from '@/entities/user/ui/LoginForm.vue';
import RegisterForm from '@/entities/user/ui/RegisterForm.vue';
import { CalorieBudgetBtn, CalorieBudgetForm } from '@/features/calorie-budget';
import { AppModal } from '@/shared/ui/modal';

const showLoginForm = ref(false);
const showRegisterForm = ref(false);
const showCalorieBudgetForm = ref(false);
</script>

<template>
  <header class="header">
    <RouterLink to="/" class="logo">Food Tracker</RouterLink>
    <button @click="showLoginForm = true">Login</button>
    <button @click="showRegisterForm = true">Register</button>
    <CalorieBudgetBtn @click="showCalorieBudgetForm = true" />
    <AppModal v-model="showLoginForm">
      <LoginForm @close="showLoginForm = false" />
    </AppModal>
    <AppModal v-model="showRegisterForm">
      <RegisterForm @close="showRegisterForm = false" />
    </AppModal>
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
