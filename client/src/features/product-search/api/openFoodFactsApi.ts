import { openfoodfactsHttp } from '@/shared/api/http';

export const API_BASE = '/cgi/search.pl';

export interface OpenFoodFactsResponse {
  products: any[];
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
    fields: 'code,product_name,generic_name,nutriments', //TODO
  };

  const { data } = await openfoodfactsHttp.get(API_BASE, { params });
  return data;
}
