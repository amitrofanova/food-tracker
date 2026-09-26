<script setup lang="ts">
import { useUserStore } from "@/entities/user";
import { AppButton } from "@/shared/ui/button";
import { AppInput } from "@/shared/ui/input";

const userStore = useUserStore();

const emit = defineEmits<{ (e: "close"): void }>();

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const localError = ref<string | null>(null);
const error = computed(() => localError.value ?? userStore.error);

const MIN_PASSWORD_LENGTH = 8;

const onSubmit = async () => {
  localError.value = null;
  if (password.value.length < MIN_PASSWORD_LENGTH) {
    localError.value = `Пароль должен содержать минимум ${MIN_PASSWORD_LENGTH} символов`;
    return;
  }
  if (password.value !== confirmPassword.value) {
    localError.value = "Пароли не совпадают";
    return;
  }
  loading.value = true;
  await userStore.register(email.value, password.value);
  loading.value = false;
  if (!userStore.error) {
    email.value = "";
    password.value = "";
    confirmPassword.value = "";
    emit("close");
  }
};
</script>

<template>
  <form @submit.prevent="onSubmit">
    <AppInput v-model="email" type="email" placeholder="Email" />
    <AppInput v-model="password" type="password" placeholder="Пароль" />
    <AppInput v-model="confirmPassword" type="password" placeholder="Повторите пароль" />
    <div v-if="error" class="error">{{ error }}</div>
    <AppButton type="submit" :disabled="loading">Зарегистрироваться</AppButton>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
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
