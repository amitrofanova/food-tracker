import { http } from "./http";
import type { MealType } from "@/shared/config";

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

export type ApiDiaryEntry = {
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

export async function fetchDiaryEntries(date?: string): Promise<ApiDiaryEntry[]> {
  const params = date ? { date } : {};
  const { data } = await http.get<ApiDiaryEntry[]>("/entries", { params });
  return data;
}

export async function saveDiaryEntry(entry: EntryCreatePayload) {
  return http.post("/entries", entry);
}

export async function updateDiaryEntry(
  id: string,
  data: { weight?: number; mealType?: MealType },
): Promise<ApiDiaryEntry> {
  const { data: result } = await http.patch<ApiDiaryEntry>(`/entries/${id}`, data);
  return result;
}

export async function deleteDiaryEntry(id: string) {
  return http.delete(`/entries/${id}`);
}
