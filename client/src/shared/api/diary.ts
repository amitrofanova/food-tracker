import { http } from './http';
import type { IDiaryEntry } from '@/entities/diary-entry';

export async function fetchDiaryEntries(date?: string): Promise<IDiaryEntry[]> {
  const params = date ? { date } : {};
  const { data } = await http.get('/entries', { params });
  return data;
}

export async function saveDiaryEntry(entry: Omit<IDiaryEntry, 'id'>) {
  return http.post('/entries', entry);
}

export async function deleteDiaryEntry(id: string) {
  return http.delete(`/entries/${id}`);
}
