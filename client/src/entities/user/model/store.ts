import { defineStore } from 'pinia';
import { registerUser, loginUser, getCurrentUser, updateCurrentUser } from '@/shared/api/auth';
import { db } from '@/shared/db';
import type { IUser } from './types';

export const useUserStore = defineStore('user', () => {
  const user = ref<IUser | null>(null);
  const error = ref<string | null>(null);
  const hasPendingSync = ref(false);

  // Restore session from token on app load
  async function init() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await getCurrentUser();
      user.value = data;
    } catch {
      localStorage.removeItem('token');
    }
  }

  async function login(email: string, password: string) {
    try {
      error.value = null;
      const { data } = await loginUser({ email, password });
      localStorage.setItem('token', data.token);
      user.value = data.user;
      const localEntries = await db.getAllEntries();
      if (localEntries.length > 0) {
        hasPendingSync.value = true;
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      error.value = axiosErr.response?.data?.error || 'Login failed';
    }
  }

  async function register(email: string, password: string) {
    try {
      error.value = null;
      await registerUser({ email, password });
      await login(email, password);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      error.value = axiosErr.response?.data?.error || 'Registration failed';
    }
  }

  function logout() {
    localStorage.removeItem('token');
    user.value = null;
    hasPendingSync.value = false;
  }

  async function setCalorieBudget(budget: number) {
    if (!user.value) return;
    const { data } = await updateCurrentUser({ calorieBudget: budget });
    user.value = data;
  }

  const isLoggedIn = computed(() => user.value !== null);

  init();

  return { user, error, isLoggedIn, hasPendingSync, login, register, logout, setCalorieBudget };
});
