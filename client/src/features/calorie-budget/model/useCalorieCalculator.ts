import type { CalorieFormData, CalorieResult, ValidationErrors } from './types';
import { calculateBMR, calculateTDEE, calculateGoalCalories } from './calculations';
import { MIN_GOAL_DAYS } from './constants';

const DEFAULT_FORM: CalorieFormData = {
  gender: 'male',
  age: '',
  weight: '',
  height: '',
  activityLevel: 'moderate',
  goal: 'maintain',
  targetWeight: '',
  targetDate: '',
};

// Parse a YYYY-MM-DD string as a local date to avoid UTC off-by-one errors.
function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-').map(Number) as [number, number, number];
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function useCalorieCalculator() {
  const form = reactive<CalorieFormData>({ ...DEFAULT_FORM });
  const errors = reactive<ValidationErrors>({});
  const result = ref<CalorieResult | null>(null);

  // Reset goal-specific fields when switching to maintain.
  watch(
    () => form.goal,
    (goal) => {
      if (goal === 'maintain') {
        form.targetWeight = '';
        form.targetDate = '';
        delete errors.targetWeight;
        delete errors.targetDate;
      }
    },
  );

  const validate = (): ValidationErrors => {
    const err: ValidationErrors = {};
    const age = Number(form.age);
    const weight = Number(form.weight);
    const height = Number(form.height);

    if (!age || age < 10 || age > 100) err.age = 'Возраст: 10–100 лет';
    if (!weight || weight < 20 || weight > 300) err.weight = 'Вес: 20–300 кг';
    if (!height || height < 50 || height > 250) err.height = 'Рост: 50–250 см';

    if (form.goal !== 'maintain') {
      const targetWeight = Number(form.targetWeight);
      if (!form.targetWeight || !targetWeight) {
        err.targetWeight = 'Укажите целевой вес';
      } else if (targetWeight < 20 || targetWeight > 300) {
        err.targetWeight = 'Целевой вес: 20–300 кг';
      } else if (form.goal === 'lose' && targetWeight >= weight) {
        err.targetWeight = 'Целевой вес должен быть меньше текущего';
      } else if (form.goal === 'gain' && targetWeight <= weight) {
        err.targetWeight = 'Целевой вес должен быть больше текущего';
      }

      if (!form.targetDate) {
        err.targetDate = 'Укажите дату';
      } else {
        const targetDate = parseLocalDate(form.targetDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysUntil = Math.round(
          (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysUntil < MIN_GOAL_DAYS) {
          err.targetDate = `Минимум через ${MIN_GOAL_DAYS} дней`;
        }
      }
    }

    return err;
  };

  const calculate = () => {
    Object.keys(errors).forEach((key) => delete errors[key as keyof ValidationErrors]);
    Object.assign(errors, validate());

    if (Object.keys(errors).length > 0) {
      result.value = null;
      return;
    }

    const age = Number(form.age);
    const weight = Number(form.weight);
    const height = Number(form.height);

    const bmr = calculateBMR(form.gender, weight, height, age);
    const tdee = Math.round(calculateTDEE(bmr, form.activityLevel));

    if (form.goal === 'maintain') {
      result.value = {
        bmr: Math.round(bmr),
        tdee,
        targetCalories: tdee,
        dailyDeficitOrSurplus: 0,
        weeklyWeightChange: 0,
        daysToGoal: null,
        adjustedTargetDate: null,
        wasAdjusted: false,
      };
      return;
    }

    const goalResult = calculateGoalCalories({
      tdee,
      currentWeight: weight,
      targetWeight: Number(form.targetWeight),
      targetDate: parseLocalDate(form.targetDate),
      goal: form.goal,
      gender: form.gender,
    });

    result.value = {
      bmr: Math.round(bmr),
      tdee,
      targetCalories: goalResult.targetCalories,
      dailyDeficitOrSurplus: goalResult.dailyDeficitOrSurplus,
      weeklyWeightChange: goalResult.weeklyWeightChange,
      daysToGoal: goalResult.daysToGoal,
      adjustedTargetDate: goalResult.adjustedTargetDate
        ? formatDate(goalResult.adjustedTargetDate)
        : null,
      wasAdjusted: goalResult.wasAdjusted,
    };
  };

  const clearError = (field: keyof ValidationErrors) => {
    if (errors[field]) delete errors[field];
  };

  return { form, errors, result, calculate, clearError };
}
