import { db } from '@/shared/db';
import type { IProduct } from '@/entities/product';
import { upsertProduct } from '@/shared/api/products';

const isAuthenticated = () => !!localStorage.getItem('token');

export function useCreateProduct() {
  const error = ref<string | null>(null);

  const createProduct = async (formData: IProduct): Promise<IProduct> => {
    try {
      error.value = null;

      const newProduct = formData;
      await db.putCustomProduct(newProduct);
      if (isAuthenticated()) {
        await upsertProduct(newProduct);
      }
      return newProduct;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create product';
      console.error('Failed to create product:', err);
      throw err;
    }
  };

  return { createProduct, error };
}
