import { http } from './http';
import type { IProduct } from '@/entities/product';

export async function fetchCustomProducts(): Promise<IProduct[]> {
  const { data } = await http.get<IProduct[]>('/custom-products');
  return data;
}

export async function upsertCustomProduct(product: IProduct): Promise<IProduct> {
  const { data } = await http.post<IProduct>('/custom-products', product);
  return data;
}

export async function deleteCustomProduct(id: string): Promise<void> {
  await http.delete(`/custom-products/${id}`);
}
