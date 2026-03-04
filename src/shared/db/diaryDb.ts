import Dexie, { type Table } from 'dexie';
import type { IDiaryEntry } from '@/entities/diary-entry';

export class DiaryDatabase extends Dexie {
  entries!: Table<IDiaryEntry, string>;

  constructor() {
    super('CalorieTrackerDB');
    this.version(2).stores({
      entries: 'id, date, mealType, productId',
    });
  }
}

export const diaryDb = new DiaryDatabase();
