import { http } from './http';
import type { RecipeDto } from '@/shared/model';

export async function fetchRecipes(): Promise<RecipeDto[]> {
  const { data } = await http.get<RecipeDto[]>('/recipes');
  return data;
}

export async function upsertRecipe(recipe: RecipeDto): Promise<RecipeDto> {
  const { data } = await http.post<RecipeDto>('/recipes', recipe);
  return data;
}

export async function deleteRecipeApi(id: string): Promise<void> {
  await http.delete(`/recipes/${id}`);
}
