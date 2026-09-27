import { storeToRefs } from "pinia";
import { useRecipeStore } from "@/entities/recipe";

export function useRecipes() {
  const store = useRecipeStore();
  const { recipes, isLoading } = storeToRefs(store);

  return {
    recipes,
    isLoading,
    loadAll: store.loadAll,
    save: store.save,
    remove: store.remove,
  };
}
