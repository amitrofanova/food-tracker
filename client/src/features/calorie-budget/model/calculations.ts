import type { Gender } from './types';
import {
  ACTIVITY_MULTIPLIERS,
  KCAL_PER_KG_FAT,
  MAX_DAILY_DEFICIT,
  MAX_DAILY_SURPLUS,
  MIN_SAFE_CALORIES,
} from './constants';

// Mifflin-St Jeor equation (1990)
// Validated as the most accurate BMR predictor for the general population,
// outperforming the older Harris-Benedict (1919) formula in multiple meta-analyses.
//
//   Male:   BMR = 10W + 6.25H − 5A + 5
//   Female: BMR = 10W + 6.25H − 5A − 161
//
// W = weight (kg), H = height (cm), A = age (years)
export function calculateBMR(gender: Gender, weight: number, height: number, age: number): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

// TDEE = Total Daily Energy Expenditure
// Multiplies BMR by a physical activity factor (Ainsworth et al. compendium).
export function calculateTDEE(
  bmr: number,
  activityLevel: keyof typeof ACTIVITY_MULTIPLIERS,
): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

export interface GoalCaloriesInput {
  tdee: number;
  currentWeight: number;
  targetWeight: number;
  targetDate: Date;
  goal: 'lose' | 'gain';
  gender: Gender;
}

export interface GoalCaloriesResult {
  targetCalories: number;
  dailyDeficitOrSurplus: number; // negative = deficit (loss), positive = surplus (gain)
  weeklyWeightChange: number; // kg/week; negative = loss
  daysToGoal: number;
  adjustedTargetDate: Date | null;
  wasAdjusted: boolean;
}

export function calculateGoalCalories(input: GoalCaloriesInput): GoalCaloriesResult {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Math.round((input.targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Wishnofsky's rule: a deficit/surplus of ~7700 kcal changes body weight by 1 kg.
  // This is an approximation; real fat tissue also contains water and protein,
  // but 7700 kcal/kg is the accepted clinical standard for planning purposes.
  const weightDiff = Math.abs(input.targetWeight - input.currentWeight);
  const totalKcal = weightDiff * KCAL_PER_KG_FAT;

  // Average daily calorie change required to reach the goal by the chosen date.
  const requiredDailyChange = totalKcal / days;

  const maxDailyChange = input.goal === 'lose' ? MAX_DAILY_DEFICIT : MAX_DAILY_SURPLUS;
  const minSafe = MIN_SAFE_CALORIES[input.gender];

  let actualDailyChange: number;
  let adjustedTargetDate: Date | null = null;

  if (requiredDailyChange > maxDailyChange) {
    // The chosen deadline demands an unsafe rate of change.
    // Cap at the evidence-based safe maximum and compute a realistic target date.
    actualDailyChange = maxDailyChange;
    const safeDays = Math.ceil(totalKcal / maxDailyChange);
    adjustedTargetDate = new Date(today.getTime() + safeDays * 24 * 60 * 60 * 1000);
  } else {
    actualDailyChange = requiredDailyChange;
  }

  // Apply the deficit or surplus to TDEE to get the recommended daily intake.
  let targetCalories =
    input.goal === 'lose' ? input.tdee - actualDailyChange : input.tdee + actualDailyChange;

  // Hard floor: never recommend less than the clinically safe minimum intake.
  // If the floor kicks in, the effective deficit is smaller than planned.
  if (input.goal === 'lose') {
    targetCalories = Math.max(targetCalories, minSafe);
  }

  targetCalories = Math.round(targetCalories);

  // Recalculate the effective daily change after applying the safety floor.
  const effectiveDailyChange =
    input.goal === 'lose' ? input.tdee - targetCalories : targetCalories - input.tdee;

  // Expected weekly weight change (kg) derived from effective daily energy change.
  // Δweight/week = (daily_change × 7 days) ÷ 7700 kcal/kg
  const weeklyWeightChange =
    ((input.goal === 'lose' ? -1 : 1) * effectiveDailyChange * 7) / KCAL_PER_KG_FAT;

  // True number of days to reach the goal at the effective rate.
  const daysToGoal = Math.ceil(totalKcal / effectiveDailyChange);

  return {
    targetCalories,
    dailyDeficitOrSurplus: input.goal === 'lose' ? -effectiveDailyChange : effectiveDailyChange,
    weeklyWeightChange: Math.round(weeklyWeightChange * 100) / 100,
    daysToGoal,
    adjustedTargetDate,
    wasAdjusted: adjustedTargetDate !== null,
  };
}
