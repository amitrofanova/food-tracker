import { defineStore } from "pinia";
import { watch } from "vue";
import { deleteRecipeApi, fetchRecipes, upsertRecipe } from "@/shared/api";
import { db } from "@/shared/db";
import { dataSyncVersion } from "@/shared/lib/dataSync";
import { useSyncedEntity } from "@/shared/lib/useSyncedEntity";
import type { IRecipe } from "./types";

export const useRecipeStore = defineStore("recipes", () => {
  const { items, isLoading, loadAll, save, remove } = useSyncedEntity<IRecipe>(
    {
      fetchServer: fetchRecipes,
      upsertServer: upsertRecipe,
      deleteServer: deleteRecipeApi,
      getAllLocal: () => db.getAllRecipes(),
      clearLocal: () => db.recipes.clear(),
      bulkPutLocal: (recipes) => db.recipes.bulkPut(recipes),
      putLocal: (recipe) => db.putRecipe(recipe),
      deleteLocal: (id) => db.deleteRecipe(id),
    },
    { bindLifecycle: false },
  );

  watch(dataSyncVersion, () => {
    void loadAll();
  });
  void loadAll();

  return {
    recipes: items,
    isLoading,
    loadAll,
    save,
    remove,
  };
});
