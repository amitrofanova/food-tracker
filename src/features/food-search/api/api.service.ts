import { API_CONFIG } from '@/shared/config/api.config';

export class FoodApiService {
  async searchFoods(query: string): Promise<any[]> {
    if (query.length < 2) return [];

    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const lang = API_CONFIG.defaultLang;
      const url = `${API_CONFIG.baseUrl}/cgi/search.pl?search_terms=${encodedQuery}&lang=${lang}&sort_by=unique_scans_n&json=1&page_size=50&action=process&fields=code,product_name,product_name_${lang},generic_name,nutriments,image_front_url,image_url,unique_scans_n`;

      const response = await fetch(url, { timeout: API_CONFIG.timeout });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Error searching foods:', error);
      return [];
    }
  }
}
