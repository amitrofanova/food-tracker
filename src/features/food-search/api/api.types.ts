export interface FoodFromAPI {
  code: string;
  product_name: string;
  product_name_ru?: string;
  generic_name?: string;
  nutriments: {
    'energy-kcal_100g': number;
    proteins_100g: number;
    fat_100g: number;
    carbohydrates_100g: number;
  };
  unique_scans_n: number;
}
