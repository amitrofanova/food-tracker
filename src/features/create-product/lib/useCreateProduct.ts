import { db } from '@/shared/db';
import type { IProduct } from '@/entities/product';

export function useCreateProduct() {
  const error = ref<string | null>(null);

  const createProduct = async (formData: IProduct): Promise<IProduct> => {
    try {
      error.value = null;
      console.log('formData', formData);

      const newProduct = formData;
      console.log('newProduct', newProduct);

      await db.putCustomProduct(newProduct);
      return newProduct;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create product';
      console.error('Failed to create product:', err);
      throw err;
    }
  };

  return { createProduct, error };
}
