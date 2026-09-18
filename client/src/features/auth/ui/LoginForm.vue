<script setup lang="ts">
import { useUserStore } from '@/entities/user';
import { AppButton } from '@/shared/ui/button';
import { AppInput } from '@/shared/ui/input';

const userStore = useUserStore();

const emit = defineEmits<{ (e: 'close'): void }>();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = computed(() => userStore.error);

const onSubmit = async () => {
  loading.value = true;
  await userStore.login(email.value, password.value);
  loading.value = false;
  if (!userStore.error) {
    email.value = '';
    password.value = '';
    emit('close');
  }
};
</script>

<template>
  <form @submit.prevent="onSubmit">
    <AppInput v-model="email" type="email" placeholder="Email" />
    <AppInput v-model="password" type="password" placeholder="Пароль" />
    <div v-if="error" class="error">{{ error }}</div>
    <AppButton type="submit" :disabled="loading">Войти</AppButton>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
form .error,
form button {
  margin-top: 0.25rem;
}
.error {
  color: rgb(var(--color-red));
  margin-top: 8px;
}
</style>
