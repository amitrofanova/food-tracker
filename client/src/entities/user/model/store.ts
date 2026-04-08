import { defineStore } from 'pinia';
import { db } from '@/shared/db';
import type { IUser } from './types';

export const useUserStore = defineStore('user', () => {
  const user = ref<IUser | null>(null);
  const error = ref<string | null>(null);

  async function init() {
    try {
      error.value = null;
      const userName = 'Alena';
      let loadedUser = await db.getUser(userName);
      if (!loadedUser) {
        loadedUser = { id: Date.now().toString(), name: userName, calorieBudget: 2000 };
        await db.saveUser(loadedUser);
      }
      user.value = loadedUser;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize user';
      console.error('User initialization error:', err);
    }
  }

  async function setCalorieBudget(budget: number) {
    try {
      error.value = null;
      if (!user.value) {
        throw new Error('User not initialized');
      }
      user.value.calorieBudget = budget;
      await db.updateCalorieBudget(user.value.id, budget);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update calorie budget';
      console.error('Calorie budget update error:', err);
      throw err;
    }
  }

  init();

  return { user, error, setCalorieBudget };
});
