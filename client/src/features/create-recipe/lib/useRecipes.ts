import { db } from '@/shared/db';
import type { IRecipe } from '@/entities/recipe';
import { fetchRecipes, upsertRecipe, deleteRecipeApi } from '@/shared/api/recipes';
import { useUserStore } from '@/entities/user';

const isAuthenticated = () => !!localStorage.getItem('token');

export function useRecipes() {
  const recipes = ref<IRecipe[]>([]);
  const isLoading = ref(false);
  const userStore = useUserStore();

  const loadAll = async () => {
    isLoading.value = true;
    try {
      if (isAuthenticated()) {
        try {
          const serverRecipes = await fetchRecipes();
          await db.recipes.clear();
          if (serverRecipes.length) await db.recipes.bulkPut(serverRecipes);
          recipes.value = serverRecipes;
        } catch {
          recipes.value = await db.getAllRecipes();
        }
      } else {
        recipes.value = await db.getAllRecipes();
      }
    } finally {
      isLoading.value = false;
    }
  };

  const save = async (recipe: IRecipe) => {
    if (isAuthenticated()) {
      const saved = await upsertRecipe(recipe);
      await db.putRecipe(saved);
      const idx = recipes.value.findIndex((r) => r.id === saved.id);
      if (idx >= 0) recipes.value[idx] = saved;
      else recipes.value.push(saved);
    } else {
      await db.putRecipe(recipe);
      const idx = recipes.value.findIndex((r) => r.id === recipe.id);
      if (idx >= 0) recipes.value[idx] = recipe;
      else recipes.value.push(recipe);
    }
  };

  const remove = async (id: string) => {
    if (isAuthenticated()) {
      await deleteRecipeApi(id);
    }
    await db.deleteRecipe(id);
    recipes.value = recipes.value.filter((r) => r.id !== id);
  };

  onMounted(loadAll);
  watch(() => userStore.syncVersion, loadAll);

  return { recipes, isLoading, save, remove, loadAll };
}
