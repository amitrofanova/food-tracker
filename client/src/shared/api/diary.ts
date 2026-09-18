import { http } from './http';
import type { IDiaryEntry } from '@/entities/diary-entry';
import { macrosPer100gFromIndexedDbEntry } from '@/entities/diary-entry/model/types';
import type { MealType } from '@/shared/config/meals';

export interface EntryCreatePayload {
  date: string;
  productId?: string;
  productName: string;
  mealType: MealType;
  weight: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

type ApiDiaryEntry = {
  id: string;
  date: string;
  productId?: string | null;
  productName: string;
  mealType: MealType;
  weight: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

/** Map GET/PATCH /api/entries: macros on the row are the per-100g snapshot. */
export function fromApiDiaryEntry(data: ApiDiaryEntry): IDiaryEntry {
  return {
    id: String(data.id),
    date: data.date,
    productId: data.productId ?? '',
    productName: data.productName,
    mealType: data.mealType,
    weight: data.weight,
    calories: data.calories,
    protein: data.protein,
    fat: data.fat,
    carbs: data.carbs,
    macrosPer100g: true,
  };
}

/** POST /api/entries: calories/protein/fat/carbs are always per 100g. */
export function toEntryCreatePayload(entry: IDiaryEntry): EntryCreatePayload {
  const macros = macrosPer100gFromIndexedDbEntry(entry);
  return {
    date: entry.date,
    ...(entry.productId ? { productId: entry.productId } : {}),
    productName: entry.productName,
    mealType: entry.mealType,
    weight: entry.weight,
    calories: macros.calories,
    protein: macros.protein,
    fat: macros.fat,
    carbs: macros.carbs,
  };
}

export async function fetchDiaryEntries(date?: string): Promise<IDiaryEntry[]> {
  const params = date ? { date } : {};
  const { data } = await http.get<ApiDiaryEntry[]>('/entries', { params });
  return data.map(fromApiDiaryEntry);
}

export async function saveDiaryEntry(entry: EntryCreatePayload) {
  return http.post('/entries', entry);
}

export async function updateDiaryEntry(
  id: string,
  data: { weight?: number; mealType?: MealType },
): Promise<IDiaryEntry> {
  const { data: result } = await http.patch<ApiDiaryEntry>(`/entries/${id}`, data);
  return fromApiDiaryEntry(result);
}

export async function deleteDiaryEntry(id: string) {
  return http.delete(`/entries/${id}`);
}
