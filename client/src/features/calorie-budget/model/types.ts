export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose' | 'maintain' | 'gain';

export interface CalorieFormData {
  gender: Gender;
  age: string;
  weight: string;
  height: string;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface CalorieResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  dailyDeficitOrSurplus: number;
}

export interface ValidationErrors {
  age?: string;
  weight?: string;
  height?: string;
}
