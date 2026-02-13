export const API_CONFIG = {
  baseUrl: 'https://world.openfoodfacts.org',
  defaultLang: 'ru',
  timeout: 5000,
  cacheDuration: 24 * 60 * 60 * 1000, // 24 часа
} as const;
