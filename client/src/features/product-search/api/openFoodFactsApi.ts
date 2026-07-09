import { http } from '@/shared/api/http';
import type { OpenFoodFactsProduct } from '../model/mappers';

export interface OpenFoodFactsResponse {
  products: OpenFoodFactsProduct[];
  page: number;
  page_count: number;
  page_size: number;
  count: number;
}

export async function searchProducts(query: string, page = 1): Promise<OpenFoodFactsResponse> {
  const { data } = await http.get<OpenFoodFactsResponse>('/products/search', {
    params: { q: query.trim(), page },
  });
  return data;
}

export async function getProductByBarcode(barcode: string): Promise<OpenFoodFactsProduct | null> {
  const { data } = await http.get<{ status: number; product: OpenFoodFactsProduct | null }>(
    `/products/barcode/${barcode}`,
  );
  if (data.status !== 1 || !data.product) return null;
  return data.product;
}
