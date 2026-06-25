import { db } from '@/shared/db';
import type { IRecipe } from '@/entities/recipe';
import { fetchRecipes, upsertRecipe, deleteRecipeApi } from '@/shared/api/recipes';
import { useUserStore } from '@/entities/user';
import { useSyncedEntity } from '@/shared/lib/useSyncedEntity';
import { toRef } from 'vue';

export function useRecipes() {
  const userStore = useUserStore();

  const {
    items: recipes,
    isLoading,
    loadAll,
    save,
    remove,
  } = useSyncedEntity<IRecipe>(
    {
      fetchServer: fetchRecipes,
      upsertServer: upsertRecipe,
      deleteServer: deleteRecipeApi,
      getAllLocal: () => db.getAllRecipes(),
      clearLocal: () => db.recipes.clear(),
      bulkPutLocal: (items) => db.recipes.bulkPut(items),
      putLocal: (item) => db.putRecipe(item),
      deleteLocal: (id) => db.deleteRecipe(id),
    },
    toRef(userStore, 'syncVersion'),
  );

  return { recipes, isLoading, save, remove, loadAll };
}
