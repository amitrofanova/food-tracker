import type { MealType } from '@/shared/config';

export type VoiceIntentKind = 'add_entry' | 'unknown' | 'needs_clarification';

export interface VoiceMatchedProduct {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface VoiceIntent {
  productName: string;
  searchQuery: string;
  weight: number | null;
  meal: MealType;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  matchedProduct: VoiceMatchedProduct | null;
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

export type VoiceParseApiResponse = {
  intent?: string;
  productName?: string | null;
  searchQuery?: string | null;
  weight?: number | null;
  meal?: string;
  calories?: number | null;
  protein?: number | null;
  fat?: number | null;
  carbs?: number | null;
  matchedProduct?: VoiceMatchedProduct | null;
};

function toNullable(value: number | null | undefined): number | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return Math.max(0, Math.round(value));
}

export function mapVoiceParseResponse(data: VoiceParseApiResponse): VoiceIntent | null {
  if (data.intent && data.intent !== 'add_entry') return null;

  const productName = String(data.productName ?? '').trim();
  if (!productName) return null;

  const meal: MealType = MEAL_ALIASES[String(data.meal ?? '').toLowerCase()] ?? 'breakfast';
  const searchQuery = String(data.searchQuery ?? productName).trim() || productName;
  const matched = data.matchedProduct;
  const matchedProduct =
    matched && typeof matched.id === 'string' && typeof matched.name === 'string' ? matched : null;

  return {
    productName,
    searchQuery,
    weight:
      data.weight !== null && data.weight !== undefined
        ? Math.max(1, Math.round(Number(data.weight) || 1))
        : null,
    meal,
    calories: toNullable(data.calories ?? null),
    protein: toNullable(data.protein ?? null),
    fat: toNullable(data.fat ?? null),
    carbs: toNullable(data.carbs ?? null),
    matchedProduct,
  };
}
