import type { ActivityLevel, Goal, Gender } from './types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose: -0.15,
  maintain: 0,
  gain: 0.15,
};

export const MIN_SAFE_CALORIES: Record<Gender, number> = {
  male: 1500,
  female: 1200,
};
