import { http } from './http';
import type { IProduct } from '@/entities/product';

export async function upsertProduct(product: IProduct): Promise<IProduct> {
  const { data } = await http.post<IProduct>('/products', product);
  return data;
}
