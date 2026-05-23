import type { ActivityLevel, Gender } from './types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // Little or no exercise
  light: 1.375, // Light exercise 1–3 days/week
  moderate: 1.55, // Moderate exercise 3–5 days/week
  active: 1.725, // Hard exercise 6–7 days/week
  very_active: 1.9, // Very hard exercise / physical job
};

// Minimum clinically safe daily calorie intake by gender
// Source: AHA / AND / TOS joint guidelines
export const MIN_SAFE_CALORIES: Record<Gender, number> = {
  male: 1500,
  female: 1200,
};

// Caloric energy density of body fat (kcal per kg)
// Wishnofsky's rule (1958): widely used clinical approximation
export const KCAL_PER_KG_FAT = 7700;

// Maximum recommended daily calorie deficit to preserve lean muscle mass
// Source: ACSM guidelines — 500–1000 kcal/day corresponds to 0.5–1 kg/week loss
export const MAX_DAILY_DEFICIT = 1000;

// Maximum recommended daily calorie surplus to minimise excess fat gain
// Source: sports nutrition literature — 250–500 kcal/day for lean bulk
export const MAX_DAILY_SURPLUS = 500;

// Minimum planning horizon for a weight goal to be considered realistic
export const MIN_GOAL_DAYS = 14;
