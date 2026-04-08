import type { CalorieFormData, CalorieResult, ValidationErrors } from './types';
import { calculateBMR, calculateTargetCalories } from './calculations';
import { ACTIVITY_MULTIPLIERS } from './constants';

const DEFAULT_FORM: CalorieFormData = {
  gender: 'male',
  age: '',
  weight: '',
  height: '',
  activityLevel: 'moderate',
  goal: 'maintain',
};

export function useCalorieCalculator() {
  const form = reactive<CalorieFormData>({ ...DEFAULT_FORM });
  const errors = reactive<ValidationErrors>({});
  const result = ref<CalorieResult | null>(null);

  const validate = (): ValidationErrors => {
    const err: ValidationErrors = {};
    const age = Number(form.age);
    const weight = Number(form.weight);
    const height = Number(form.height);

    if (!age || age < 10 || age > 100) err.age = 'Возраст: 10–100 лет';
    if (!weight || weight < 20 || weight > 300) err.weight = 'Вес: 20–300 кг';
    if (!height || height < 50 || height > 250) err.height = 'Рост: 50–250 см';

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
    const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[form.activityLevel]);
    const target = calculateTargetCalories(bmr, form.activityLevel, form.goal, form.gender);

    result.value = {
      bmr: Math.round(bmr),
      tdee,
      targetCalories: target,
      dailyDeficitOrSurplus: target - tdee,
    };
  };

  const clearError = (field: keyof ValidationErrors) => {
    if (errors[field]) {
      delete errors[field];
    }
  };

  return { form, errors, result, calculate, clearError };
}
