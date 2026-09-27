import { describe, expect, it, vi, afterEach } from "vitest";
import { calculateBMR, calculateTDEE, calculateGoalCalories } from "./calculations";

describe("calculateBMR", () => {
  const weightKg = 80;
  const heightCm = 180;
  const ageYears = 30;

  it("calculates a man's BMR with the Mifflin–St Jeor equation", () => {
    expect(calculateBMR("male", weightKg, heightCm, ageYears)).toBe(1780);
  });

  it("calculates a woman's BMR with the Mifflin–St Jeor equation", () => {
    expect(calculateBMR("female", weightKg, heightCm, ageYears)).toBe(1614);
  });
});

describe("calculateTDEE", () => {
  it("multiplies BMR by the sedentary activity factor", () => {
    expect(calculateTDEE(2000, "sedentary")).toBe(2400);
  });
});

describe("calculateGoalCalories", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("subtracts a safe daily deficit from TDEE when the deadline is realistic", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1));
    const result = calculateGoalCalories({
      tdee: 2500,
      currentWeight: 80,
      targetWeight: 78,
      targetDate: new Date(2026, 2, 19),
      goal: "lose",
      gender: "male",
    });
    expect(result.targetCalories).toBe(2300);
    expect(result.dailyDeficitOrSurplus).toBe(-200);
    expect(result.weeklyWeightChange).toBe(-0.18);
    expect(result.daysToGoal).toBe(77);
    expect(result.wasAdjusted).toBe(false);
    expect(result.adjustedTargetDate).toBeNull();
  });

  it("caps an aggressive weight-loss deadline at a 1000 kcal deficit", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1));
    const result = calculateGoalCalories({
      tdee: 2600,
      currentWeight: 80,
      targetWeight: 78,
      targetDate: new Date(2026, 0, 8),
      goal: "lose",
      gender: "male",
    });
    expect(result.targetCalories).toBe(1600);
    expect(result.dailyDeficitOrSurplus).toBe(-1000);
    expect(result.weeklyWeightChange).toBe(-0.91);
    expect(result.daysToGoal).toBe(16);
    expect(result.wasAdjusted).toBe(true);
    expect(result.adjustedTargetDate).toEqual(new Date(2026, 0, 17));
  });

  it("does not recommend fewer than 1500 kcal for a man", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1));
    const result = calculateGoalCalories({
      tdee: 2000,
      currentWeight: 80,
      targetWeight: 79,
      targetDate: new Date(2026, 0, 11),
      goal: "lose",
      gender: "male",
    });
    expect(result.targetCalories).toBe(1500);
    expect(result.dailyDeficitOrSurplus).toBe(-500);
    expect(result.weeklyWeightChange).toBe(-0.45);
    expect(result.daysToGoal).toBe(16);
    expect(result.wasAdjusted).toBe(false);
    expect(result.adjustedTargetDate).toBeNull();
  });

  it("adds a safe daily surplus to TDEE when gaining weight", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1));

    const result = calculateGoalCalories({
      tdee: 2500,
      currentWeight: 80,
      targetWeight: 82,
      targetDate: new Date(2026, 2, 19),
      goal: "gain",
      gender: "male",
    });

    expect(result.targetCalories).toBe(2700);
    expect(result.dailyDeficitOrSurplus).toBe(200);
    expect(result.weeklyWeightChange).toBe(0.18);
    expect(result.daysToGoal).toBe(77);
    expect(result.wasAdjusted).toBe(false);
    expect(result.adjustedTargetDate).toBeNull();
  });
});
