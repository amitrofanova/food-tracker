import { defineStore } from "pinia";
import axios from "axios";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateCurrentUser,
  logoutUser,
  fetchCustomProducts,
  fetchRecipes,
  type AuthSessionResponse,
  type AuthUser,
} from "@/shared/api";
import { db } from "@/shared/db";
import type { IUser } from "./types";
import {
  clearNativeTokens,
  isNativePlatform,
  setNativeTokens,
  setSessionHint,
  setUnauthorizedHandler,
} from "@/shared/lib/auth";

export const useUserStore = defineStore("user", () => {
  const user = ref<IUser | null>(null);
  const error = ref<string | null>(null);
  const hasPendingSync = ref(false);
  const syncVersion = ref(0);
  const authModalOpen = ref(false);

  setUnauthorizedHandler(() => {
    user.value = null;
    hasPendingSync.value = false;
  });

  function toUser(data: AuthUser): IUser {
    const next: IUser = { id: data.id, email: data.email };
    if (typeof data.calorieBudget === "number") {
      next.calorieBudget = data.calorieBudget;
    }
    return next;
  }

  async function checkLocalData() {
    const [localEntries, localProducts, localRecipes] = await Promise.all([
      db.getAllEntries(),
      db.getAllCustomProducts(),
      db.getAllRecipes(),
    ]);

    let pendingProducts = 0;
    let pendingRecipes = 0;
    try {
      const [serverProducts, serverRecipes] = await Promise.all([
        fetchCustomProducts(),
        fetchRecipes(),
      ]);
      const serverProductIds = new Set(serverProducts.map((product) => product.id));
      const serverRecipeIds = new Set(serverRecipes.map((recipe) => recipe.id));
      pendingProducts = localProducts.filter((product) => !serverProductIds.has(product.id)).length;
      pendingRecipes = localRecipes.filter((recipe) => !serverRecipeIds.has(recipe.id)).length;
    } catch {
      // Catalog unavailable: diary IndexedDB rows are still unsynced guest data.
      pendingProducts = 0;
      pendingRecipes = 0;
    }

    hasPendingSync.value = localEntries.length + pendingProducts + pendingRecipes > 0;
  }

  async function persistSession(data: AuthSessionResponse) {
    setSessionHint(true);
    if (isNativePlatform() && data.token && data.refreshToken) {
      await setNativeTokens(data.token, data.refreshToken);
    }
    user.value = toUser(data.user);
    authModalOpen.value = false;
  }

  async function init() {
    localStorage.removeItem("token");
    try {
      const { data } = await getCurrentUser();
      user.value = toUser(data);
      setSessionHint(true);
      await checkLocalData();
    } catch {
      setSessionHint(false);
      await clearNativeTokens();
    }
  }

  async function login(email: string, password: string) {
    try {
      error.value = null;
      const { data } = await loginUser({ email, password });
      await persistSession(data);
      await checkLocalData();
    } catch (err: unknown) {
      error.value = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? "Ошибка входа")
        : "Ошибка входа";
    }
  }

  async function register(email: string, password: string) {
    try {
      error.value = null;
      await registerUser({ email, password });
      await login(email, password);
    } catch (err: unknown) {
      error.value = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? "Ошибка регистрации")
        : "Ошибка регистрации";
    }
  }

  async function logout() {
    try {
      await logoutUser();
    } catch {
      // Clear the local session even if the server call fails.
    }
    setSessionHint(false);
    await clearNativeTokens();
    user.value = null;
    hasPendingSync.value = false;
  }

  async function setCalorieBudget(budget: number) {
    if (!user.value) return;
    const { data } = await updateCurrentUser({ calorieBudget: budget });
    user.value = toUser(data);
  }

  function notifySynced() {
    syncVersion.value++;
  }

  function openAuthModal() {
    authModalOpen.value = true;
  }

  const isLoggedIn = computed(() => user.value !== null);

  init();

  return {
    user,
    error,
    isLoggedIn,
    authModalOpen,
    hasPendingSync,
    syncVersion,
    notifySynced,
    openAuthModal,
    login,
    register,
    logout,
    setCalorieBudget,
  };
});
