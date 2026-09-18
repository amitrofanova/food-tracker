import type { MealType } from '@/shared/config'; //TODO export here
import type { ApiDiaryEntry, EntryCreatePayload } from '@/shared/api';

export type DiaryMacros = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export interface IDiaryEntry extends DiaryMacros {
  id: string;
  date: string;
  productId: string;
  productName: string;
  mealType: MealType;
  weight: number;
  /**
   * IndexedDB rows written after the per-100g contract.
   * Absent on legacy guest rows, where calories/protein/fat/carbs are the eaten portion.
   */
  macrosPer100g?: boolean;
}

export type DiaryProductSnapshot = DiaryMacros & {
  id: string;
  name: string;
};

function scaleMacros(macros: DiaryMacros, factor: number): DiaryMacros {
  return {
    calories: Math.round(macros.calories * factor),
    protein: Math.round(macros.protein * factor),
    fat: Math.round(macros.fat * factor),
    carbs: Math.round(macros.carbs * factor),
  };
}

/** Portion on screen: per-100g macros * weight / 100. */
export function portionMacros(entry: DiaryMacros & { weight: number }): DiaryMacros {
  return scaleMacros(entry, entry.weight / 100);
}

export function createLocalDiaryEntry(
  product: DiaryProductSnapshot,
  input: { date: string; weight: number; mealType: MealType; id?: string },
): IDiaryEntry {
  return {
    id: input.id ?? crypto.randomUUID(),
    date: input.date,
    productId: product.id,
    productName: product.name,
    mealType: input.mealType,
    weight: input.weight,
    calories: product.calories,
    protein: product.protein,
    fat: product.fat,
    carbs: product.carbs,
    macrosPer100g: true,
  };
}

/**
 * Legacy guest rows stored the eaten portion in calories/protein/fat/carbs.
 * Convert back to per-100g so sync POST matches Product / online addEntry.
 */
export function macrosPer100gFromIndexedDbEntry(entry: IDiaryEntry): DiaryMacros {
  if (entry.macrosPer100g === true) {
    return {
      calories: entry.calories,
      protein: entry.protein,
      fat: entry.fat,
      carbs: entry.carbs,
    };
  }
  return scaleMacros(entry, 100 / entry.weight);
}

export function normalizeIndexedDbDiaryEntry(entry: IDiaryEntry): IDiaryEntry {
  if (entry.macrosPer100g === true) return entry;
  return {
    ...entry,
    ...macrosPer100gFromIndexedDbEntry(entry),
    macrosPer100g: true,
  };
}

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
