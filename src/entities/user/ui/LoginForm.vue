<template>
  <form @submit.prevent="onSubmit">
    <div>
      <label>Email</label>
      <input v-model="email" type="email" required />
    </div>
    <div>
      <label>Password</label>
      <input v-model="password" type="password" required />
    </div>
    <div v-if="error" class="error">{{ error }}</div>
    <button type="submit" :disabled="loading">Login</button>
  </form>
</template>

<script setup lang="ts">
import { useUserStore } from '@/entities/user/model/store';

const emit = defineEmits<{ (e: 'close'): void }>();

const email = ref('');
const password = ref('');
const loading = ref(false);
const userStore = useUserStore();
const error = computed(() => userStore.error);

async function onSubmit() {
  loading.value = true;
  await userStore.login(email.value, password.value);
  loading.value = false;
  if (!userStore.error) {
    emit('close');
  }
}
</script>

<style scoped>
.error {
  color: red;
  margin-top: 8px;
}
</style>
