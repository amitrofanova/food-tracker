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
  targetWeight: string;
  targetDate: string;
}

export interface CalorieResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  dailyDeficitOrSurplus: number;
  weeklyWeightChange: number; // kg/week; negative = loss, positive = gain
  daysToGoal: number | null; // null for maintain
  adjustedTargetDate: string | null; // formatted date; non-null when user's deadline was too aggressive
  wasAdjusted: boolean;
}

export interface ValidationErrors {
  age?: string;
  weight?: string;
  height?: string;
  targetWeight?: string;
  targetDate?: string;
}
