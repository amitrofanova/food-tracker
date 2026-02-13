// src/features/food-search/data/food-cache.service.ts
import type { FoodItem } from '@/types';

export class FoodCacheService {
  private memoryCache: Record<string, FoodItem[]> = {};
  private readonly CACHE_KEY = 'foodSearchCache';

  loadCacheFromStorage(): void {
    const cached = localStorage.getItem(this.CACHE_KEY);
    if (cached) {
      try {
        this.memoryCache = JSON.parse(cached);
      } catch (e) {
        console.error('Ошибка загрузки кэша поиска:', e);
        this.memoryCache = {};
      }
    }
  }

  saveCacheToStorage(): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.memoryCache));
    } catch (e) {
      console.warn('Не удалось сохранить кэш поиска', e);
    }
  }

  get(cacheKey: string): FoodItem[] | undefined {
    return this.memoryCache[cacheKey];
  }

  set(cacheKey: string, results: FoodItem[]): void {
    this.memoryCache[cacheKey] = results;
    this.saveCacheToStorage();
  }

  clear(): void {
    this.memoryCache = {};
    localStorage.removeItem(this.CACHE_KEY);
  }
}
