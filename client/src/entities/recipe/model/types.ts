export interface IRecipeIngredient {
  productId: string;
  productName: string;
  weight: number; // grams used in this recipe
  calories: number; // per 100g
  protein: number; // per 100g
  fat: number; // per 100g
  carbs: number; // per 100g
}

export interface IRecipe {
  id: string;
  name: string;
  totalWeight: number; // sum of all ingredient weights
  ingredients: IRecipeIngredient[];
  // per-100g values derived from ingredients (for use as IProduct in diary)
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}
