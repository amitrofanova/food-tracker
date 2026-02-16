import { useDiaryStore } from '@/entities/diary-entry';
import type { IProduct } from '@/entities/product';

export function useAddToDiary() {
  const diaryStore = useDiaryStore();

  const addEntry = (product: IProduct, weight: number) => {
    const factor = weight / 100;
    diaryStore.addEntry({
      date: diaryStore.selectedDate,
      productId: product.id,
      productName: product.name,
      weight,
      calories: Math.round(product.calories * factor),
      protein: Math.round(product.protein * factor * 10) / 10,
      fat: Math.round(product.fat * factor * 10) / 10,
      carbs: Math.round(product.carbs * factor * 10) / 10,
    });
  };

  return { addEntry };
}
