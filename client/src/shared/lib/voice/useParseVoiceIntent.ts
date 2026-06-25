import type { MealType } from '@/shared/config/meals';
import { http } from '@/shared/api/http';
import axios from 'axios';

export interface VoiceIntent {
  productName: string;
  weight: number;
  meal: MealType;
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

export function useParseVoiceIntent() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const parse = async (transcript: string, defaultMeal?: MealType): Promise<VoiceIntent | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await http.post<{ productName: string; weight: number; meal: string }>(
        '/voice/parse',
        { transcript, defaultMeal },
      );

      const meal: MealType = MEAL_ALIASES[String(data.meal ?? '').toLowerCase()] ?? 'breakfast';

      return {
        productName: String(data.productName ?? '').trim(),
        weight: Math.max(1, Math.round(Number(data.weight) || 100)),
        meal,
      };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const raw = err.response?.data?.raw as string | undefined;
        const msg = err.response?.data?.error as string | undefined;
        if (err.response?.status === 429) {
          error.value = 'Превышен лимит запросов — подождите минуту';
        } else {
          console.error('Voice parse error', msg, 'raw AI output:', raw);
          error.value = msg ?? 'Ошибка разбора команды';
        }
      } else {
        error.value = err instanceof Error ? err.message : 'Ошибка разбора команды';
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return { parse, isLoading, error };
}
