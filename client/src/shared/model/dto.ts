import type { MealType } from "@/shared/config";

export type NutritionMacrosDto = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type ProductDto = {
  id: string;
  name: string;
} & NutritionMacrosDto;

export type UserDto = {
  id: number;
  email: string;
  calorieBudget?: number;
};

export type RecipeIngredientDto = {
  productId: string;
  productName: string;
  weight: number;
} & NutritionMacrosDto;

export type RecipeDto = {
  id: string;
  name: string;
  totalWeight: number;
  ingredients: RecipeIngredientDto[];
} & NutritionMacrosDto;

export type DiaryEntryDto = {
  id: string;
  date: string;
  productId: string;
  productName: string;
  mealType: MealType;
  weight: number;
  macrosPer100g?: boolean;
} & NutritionMacrosDto;
