import { defineStore } from 'pinia';
import type { IUser } from './types';
import { db } from '@/shared/db';

export const useUserStore = defineStore('user', () => {
  const user = ref<IUser | null>(null);

  async function init() {
    const userName = 'Alena';
    let loadedUser = await db.getUser(userName);
    if (!loadedUser) {
      loadedUser = { id: Date.now(), name: userName, calorieBudget: 2000 };
      await db.saveUser(loadedUser);
    }
    user.value = loadedUser;
  }

  async function setCalorieBudget(budget: number) {
    if (!user.value) return;
    user.value.calorieBudget = budget;
    await db.updateCalorieBudget(user.value.name, budget);
  }

  init();

  return { user, setCalorieBudget };
});
