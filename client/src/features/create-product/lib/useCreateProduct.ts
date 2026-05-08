import { db } from '@/shared/db';
import type { IProduct } from '@/entities/product';
import { upsertCustomProduct } from '@/shared/api/customProducts';

const isAuthenticated = () => !!localStorage.getItem('token');

export function useCreateProduct() {
  const error = ref<string | null>(null);

  const createProduct = async (formData: IProduct): Promise<IProduct> => {
    try {
      error.value = null;

      if (isAuthenticated()) {
        const saved = await upsertCustomProduct(formData);
        await db.putCustomProduct(saved);
        return saved;
      } else {
        await db.putCustomProduct(formData);
        return formData;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create product';
      console.error('Failed to create product:', err);
      throw err;
    }
  };

  return { createProduct, error };
}
