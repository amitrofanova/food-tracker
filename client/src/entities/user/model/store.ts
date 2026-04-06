import { defineStore } from 'pinia';
import type { IUser } from './types';
import { userDb } from '@/shared/db/userDb';

export const useUserStore = defineStore('user', () => {
  const user = ref<IUser | null>(null);

  async function init() {
    const userName = 'Alena';
    let loadedUser = await userDb.getUser(userName);
    if (!loadedUser) {
      loadedUser = { id: Date.now(), name: userName, calorieBudget: 2000 };
      await userDb.saveUser(loadedUser);
    }
    user.value = loadedUser;
  }

  async function setCalorieBudget(budget: number) {
    if (!user.value) return;
    user.value.calorieBudget = budget;
    await userDb.updateCalorieBudget(user.value.name, budget);
  }

  init();

  return { user, setCalorieBudget };
});
