import { http } from './http';
import type { IDiaryEntry } from '@/entities/diary-entry';
import type { MealType } from '@/shared/config/meals';

export interface EntryCreatePayload {
  date: string;
  productId: string;
  productName: string;
  mealType: MealType;
  weight: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export async function fetchDiaryEntries(date?: string): Promise<IDiaryEntry[]> {
  const params = date ? { date } : {};
  const { data } = await http.get('/entries', { params });
  return data;
}

export async function saveDiaryEntry(entry: EntryCreatePayload) {
  return http.post('/entries', entry);
}

export async function deleteDiaryEntry(id: string) {
  return http.delete(`/entries/${id}`);
}
