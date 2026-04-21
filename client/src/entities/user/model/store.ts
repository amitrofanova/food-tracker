import { defineStore } from 'pinia';
import { registerUser, loginUser, getCurrentUser } from '@/shared/api/auth';
import type { IUser } from './types';

export const useUserStore = defineStore('user', () => {
  const user = ref<IUser | null>(null);
  const error = ref<string | null>(null);

  // Restore session from token on app load
  async function init() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await getCurrentUser();
      const calorieBudget = Number(localStorage.getItem('calorieBudget')) || undefined;
      user.value = { ...data, calorieBudget };
    } catch {
      localStorage.removeItem('token');
    }
  }

  async function login(email: string, password: string) {
    try {
      error.value = null;
      const { data } = await loginUser({ email, password });
      localStorage.setItem('token', data.token);
      const calorieBudget = Number(localStorage.getItem('calorieBudget')) || undefined;
      user.value = { ...data.user, calorieBudget };
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      error.value = axiosErr.response?.data?.error || 'Login failed';
    }
  }

  async function register(email: string, password: string) {
    try {
      error.value = null;
      await registerUser({ email, password });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      error.value = axiosErr.response?.data?.error || 'Registration failed';
    }
  }

  function logout() {
    localStorage.removeItem('token');
    user.value = null;
  }

  async function setCalorieBudget(budget: number) {
    if (!user.value) return;
    user.value = { ...user.value, calorieBudget: budget };
    localStorage.setItem('calorieBudget', String(budget));
  }

  init();

  return { user, error, login, register, logout, setCalorieBudget };
});
