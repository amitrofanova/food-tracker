import type { IProduct } from '@/entities/product/model/types';

export interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  product_name_ru: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    energy_100g?: number;
    proteins_100g?: number;
    fat_100g?: number;
    carbohydrates_100g?: number;
  };
}

export function mapOpenFoodFactsToProduct(dto: OpenFoodFactsProduct): IProduct {
  const nutriments = dto.nutriments || {};
  return {
    id: dto.code,
    name: dto.product_name,
    calories: Math.round(nutriments['energy-kcal_100g'] || 0),
    protein: nutriments.proteins_100g || 0,
    fat: nutriments.fat_100g || 0,
    carbs: nutriments.carbohydrates_100g || 0,
  };
}
