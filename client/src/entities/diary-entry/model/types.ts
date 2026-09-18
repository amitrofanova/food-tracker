import type { MealType } from '@/shared/config/meals'; //TODO export here

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
