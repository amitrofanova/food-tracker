export type Macronutrients = {
  protein: number;
  fat: number;
  carbs: number;
};

export type FoodItem = {
  id: string;
  name: string;
  calories: number;
} & Macronutrients;

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type DailyEntry = {
  id: string;
  name: string;
  portion: number;
  mealType: MealType;
  timestamp: Date;
  image?: string | null;
} & Macronutrients & {
    calories: number;
  };
