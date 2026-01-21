import LOCAL_FOODS from '@/assets/foods.json';
import type { FoodItem } from '@/shared/types';

export const searchLocalFoods = (query: string): FoodItem[] => {
  const normalizedQuery = query.toLowerCase().trim();

  return LOCAL_FOODS.filter((food) => food.name.toLowerCase().includes(normalizedQuery)).map(
    (food) => ({
      ...food,
      id: crypto.randomUUID(),
      source: 'local',
    }),
  );
};
