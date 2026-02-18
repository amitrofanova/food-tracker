import type { MealType } from '@/shared/config/meals'; //TODO export here

export interface IDiaryEntry {
  id: string;
  date: string;
  productId: string;
  productName: string;
  mealType: MealType;
  weight: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}
