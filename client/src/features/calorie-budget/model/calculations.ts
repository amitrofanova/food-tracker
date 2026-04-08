import type { Gender, ActivityLevel, Goal } from './types';
import { ACTIVITY_MULTIPLIERS, GOAL_ADJUSTMENTS, MIN_SAFE_CALORIES } from './constants';

export function calculateBMR(gender: Gender, weight: number, height: number, age: number): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

export function calculateTargetCalories(
  bmr: number,
  activityLevel: ActivityLevel,
  goal: Goal,
  gender: Gender,
): number {
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];
  let target = tdee * (1 + GOAL_ADJUSTMENTS[goal]);

  target = Math.max(target, MIN_SAFE_CALORIES[gender]);
  return Math.round(target);
}
