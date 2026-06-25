import { openfoodfactsHttp } from '@/shared/api/http';
import type { OpenFoodFactsProduct } from '../model/mappers';

export const API_BASE = '/cgi/search.pl';
const PRODUCT_FIELDS = 'code,product_name,generic_name,nutriments';

export interface OpenFoodFactsResponse {
  products: OpenFoodFactsProduct[];
  page: number;
  page_count: number;
  page_size: number;
  count: number;
}

export async function searchProducts(query: string, page = 1): Promise<OpenFoodFactsResponse> {
  const params = {
    search_terms: query.trim(),
    lang: 'en',
    // lc: 'ru',
    page,
    page_size: 20,
    json: 1,
    action: 'process',
    // sort_by: 'unique_scans_n',
    fields: PRODUCT_FIELDS,
  };

  const { data } = await openfoodfactsHttp.get(API_BASE, { params });
  return data;
}

export async function getProductByBarcode(barcode: string): Promise<OpenFoodFactsProduct | null> {
  const { data } = await openfoodfactsHttp.get(`/api/v2/product/${barcode}.json`, {
    params: { fields: PRODUCT_FIELDS },
  });
  if (data.status !== 1 || !data.product) return null;
  return data.product as OpenFoodFactsProduct;
}
