import { http } from './http';
import type { IRecipe } from '@/entities/recipe';

export async function fetchRecipes(): Promise<IRecipe[]> {
  const { data } = await http.get<IRecipe[]>('/recipes');
  return data;
}

export async function upsertRecipe(recipe: IRecipe): Promise<IRecipe> {
  const { data } = await http.post<IRecipe>('/recipes', recipe);
  return data;
}

export async function deleteRecipeApi(id: string): Promise<void> {
  await http.delete(`/recipes/${id}`);
}
