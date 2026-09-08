import type { MealType } from '@/shared/config/meals';
import { http } from '@/shared/api/http';
import axios from 'axios';

export interface VoiceIntent {
  productName: string;
  weight: number | null;
  meal: MealType;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
}

const MEAL_ALIASES: Record<string, MealType> = {
  завтрак: 'breakfast',
  breakfast: 'breakfast',
  обед: 'lunch',
  lunch: 'lunch',
  ужин: 'dinner',
  dinner: 'dinner',
  перекус: 'snack',
  snack: 'snack',
};

const PARSE_FAIL_MESSAGE = 'Не получилось разобрать фразу. Попробуйте ещё раз';
const UNAVAILABLE_MESSAGE =
  'Нет связи с сервисом распознавания. Проверьте соединение и попробуйте ещё раз';
export const SESSION_EXPIRED_MESSAGE =
  'Сессия истекла. Войдите снова, чтобы использовать голосовой ввод';
const RATE_LIMIT_MESSAGE = 'Слишком много запросов подряд. Подождите немного';

export function useParseVoiceIntent() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const parse = async (transcript: string, defaultMeal?: MealType): Promise<VoiceIntent | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await http.post<{
        productName: string;
        weight: number | null;
        meal: string;
        calories: number | null;
        protein: number | null;
        fat: number | null;
        carbs: number | null;
      }>('/voice/parse', { transcript, defaultMeal });

      const meal: MealType = MEAL_ALIASES[String(data.meal ?? '').toLowerCase()] ?? 'breakfast';

      const toNullable = (v: number | null): number | null =>
        v !== null && !isNaN(v) ? Math.max(0, Math.round(v)) : null;

      const productName = String(data.productName ?? '').trim();
      if (!productName) {
        error.value = PARSE_FAIL_MESSAGE;
        return null;
      }

      return {
        productName,
        weight:
          data.weight !== null && data.weight !== undefined
            ? Math.max(1, Math.round(Number(data.weight) || 1))
            : null,
        meal,
        calories: toNullable(data.calories),
        protein: toNullable(data.protein),
        fat: toNullable(data.fat),
        carbs: toNullable(data.carbs),
      };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          error.value = SESSION_EXPIRED_MESSAGE;
        } else if (status === 429) {
          error.value = RATE_LIMIT_MESSAGE;
        } else if (!status || status === 502 || status === 503) {
          error.value = UNAVAILABLE_MESSAGE;
        } else {
          error.value = PARSE_FAIL_MESSAGE;
        }
      } else {
        error.value = UNAVAILABLE_MESSAGE;
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return { parse, isLoading, error };
}
