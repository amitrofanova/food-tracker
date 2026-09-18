import { describe, expect, it } from 'vitest';
import { createLocalDiaryEntry, portionMacros, type IDiaryEntry } from '@/entities/diary-entry/model/types';
import { fromApiDiaryEntry, toEntryCreatePayload } from '../diary';

const product = {
  id: 'oats',
  name: 'Овсянка',
  calories: 200,
  protein: 13,
  fat: 7,
  carbs: 66,
};

describe('toEntryCreatePayload', () => {
  it('sends per-100g macros for a 150g offline add, not the portion', () => {
    const local = createLocalDiaryEntry(product, {
      id: 'local-1',
      date: '2026-09-18',
      weight: 150,
      mealType: 'breakfast',
    });

    expect(local.calories).toBe(200);
    expect(portionMacros(local).calories).toBe(300);

    const payload = toEntryCreatePayload(local);

    expect(payload.calories).toBe(200);
    expect(payload.protein).toBe(13);
    expect(payload.fat).toBe(7);
    expect(payload.carbs).toBe(66);
    expect(payload.weight).toBe(150);
    expect(payload.productName).toBe('Овсянка');
    expect(payload.productId).toBe('oats');
    expect(payload).not.toHaveProperty('id');
    expect(payload).not.toHaveProperty('macrosPer100g');
  });

  it('converts legacy IndexedDB portion macros back to per-100g before POST', () => {
    const legacy: IDiaryEntry = {
      id: 'legacy-1',
      date: '2026-09-18',
      productId: product.id,
      productName: product.name,
      mealType: 'breakfast',
      weight: 150,
      calories: 300,
      protein: 20,
      fat: 11,
      carbs: 99,
    };

    const payload = toEntryCreatePayload(legacy);

    expect(payload.calories).toBe(200);
    expect(payload.protein).toBe(13);
    expect(payload.fat).toBe(7);
    expect(payload.carbs).toBe(66);
  });
});

describe('fromApiDiaryEntry', () => {
  it('reads the per-100g snapshot from the entry row, not a nested product', () => {
    const entry = fromApiDiaryEntry({
      id: '12',
      date: '2026-09-18',
      productId: null,
      productName: 'Творог',
      mealType: 'breakfast',
      weight: 150,
      calories: 100,
      protein: 16,
      fat: 5,
      carbs: 3,
    });

    expect(entry.productName).toBe('Творог');
    expect(entry.productId).toBe('');
    expect(entry.calories).toBe(100);
    expect(entry.macrosPer100g).toBe(true);
    expect(portionMacros(entry).calories).toBe(150);
  });
});
