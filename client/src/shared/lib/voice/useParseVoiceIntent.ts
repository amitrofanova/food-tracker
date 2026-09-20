import type { MealType } from '@/shared/config';
import { http } from '@/shared/api';
import axios from 'axios';
import { mapVoiceParseResponse, type VoiceIntent, type VoiceParseApiResponse } from './mapVoiceParseResponse';

export type { VoiceIntent } from './mapVoiceParseResponse';

const PARSE_FAIL_MESSAGE = 'Не получилось разобрать фразу. Попробуйте ещё раз';
const UNAVAILABLE_MESSAGE =
  'Нет связи с сервисом распознавания. Проверьте соединение и попробуйте ещё раз';
export const SESSION_EXPIRED_MESSAGE =
  'Сессия истекла. Войдите снова, чтобы использовать голосовой ввод';
const RATE_LIMIT_MESSAGE = 'Слишком много запросов подряд. Подождите немного';

export function useParseVoiceIntent() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const parse = async (
    transcript: string | string[],
    defaultMeal?: MealType,
  ): Promise<VoiceIntent | null> => {
    isLoading.value = true;
    error.value = null;

    const transcripts = (Array.isArray(transcript) ? transcript : [transcript])
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const { data } = await http.post<VoiceParseApiResponse>('/voice/parse', {
        transcript: transcripts[0],
        transcripts,
        defaultMeal,
      });

      const intent = mapVoiceParseResponse(data);
      if (!intent) {
        error.value = PARSE_FAIL_MESSAGE;
        return null;
      }
      return intent;
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
