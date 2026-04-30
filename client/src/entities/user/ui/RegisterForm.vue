<script setup lang="ts">
import { useUserStore } from '@/entities/user';
import { AppButton } from '@/shared/ui/button';

const userStore = useUserStore();

const emit = defineEmits<{ (e: 'close'): void }>();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = computed(() => userStore.error);

const onSubmit = async () => {
  loading.value = true;
  await userStore.register(email.value, password.value);
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
    <label>Email</label>
    <input v-model="email" type="email" required />
    <label>Пароль</label>
    <input v-model="password" type="password" required />
    <div v-if="error" class="error">{{ error }}</div>
    <AppButton type="submit" :disabled="loading">Зарегистрироваться</AppButton>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
form {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px 16px;
  align-items: center;
  max-width: 400px;
}
form label {
  font-weight: 500;
}
form input {
  width: 250px;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
form .error,
form button {
  grid-column: 1 / -1;
}
form button {
  margin-top: 1rem;
}
.error {
  color: rgb(var(--color-red));
  margin-top: 8px;
}
</style>
