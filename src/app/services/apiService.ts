import { API_CONFIG } from '@/app/config/config';

export const searchFoods = async (query: string): Promise<any[]> => {
  if (query.length < 2) return [];

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `${API_CONFIG.baseUrl}/cgi/search.pl?search_terms=${encodedQuery}&lang=${API_CONFIG.defaultLang}&sort_by=unique_scans_n&json=1&page_size=20&action=process&fields=code,product_name,product_name_${API_CONFIG.defaultLang},generic_name,nutriments,unique_scans_n`;

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
};

export const searchByBarcode = async (barcode: string): Promise<any | null> => {
  try {
    const url = `${API_CONFIG.baseUrl}/api/v2/product/${barcode}?lang=${API_CONFIG.defaultLang}`;
    const response = await fetch(url, { timeout: API_CONFIG.timeout });

    if (!response.ok) return null;

    const data = await response.json();
    return data.product || null;
  } catch (error) {
    console.error('Error searching by barcode:', error);
    return null;
  }
};
