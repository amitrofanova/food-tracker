import { db } from '@/shared/db';
import type { IRecipe } from '@/entities/recipe';

export function useRecipes() {
  const recipes = ref<IRecipe[]>([]);
  const isLoading = ref(false);

  const loadAll = async () => {
    isLoading.value = true;
    try {
      recipes.value = await db.getAllRecipes();
    } finally {
      isLoading.value = false;
    }
  };

  const save = async (recipe: IRecipe) => {
    await db.putRecipe(recipe);
    const idx = recipes.value.findIndex((r) => r.id === recipe.id);
    if (idx >= 0) recipes.value[idx] = recipe;
    else recipes.value.push(recipe);
  };

  const remove = async (id: string) => {
    await db.deleteRecipe(id);
    recipes.value = recipes.value.filter((r) => r.id !== id);
  };

  onMounted(loadAll);

  return { recipes, isLoading, save, remove, loadAll };
}
