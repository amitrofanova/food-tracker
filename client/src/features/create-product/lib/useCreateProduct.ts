import { productDb } from '@/shared/db/productDb';
import type { IProduct } from '@/entities/product';

export function useCreateProduct() {
  const createProduct = async (formData: IProduct): Promise<IProduct> => {
    console.log('formData', formData);

    const newProduct = formData;
    console.log('newProduct', newProduct);

    await productDb.putCustomProduct(newProduct);
    return newProduct;
  };

  return { createProduct };
}
