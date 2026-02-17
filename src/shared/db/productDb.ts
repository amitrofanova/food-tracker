import Dexie, { type Table } from 'dexie';
import type { IProduct } from '@/entities/product';

export class ProductDatabase extends Dexie {
  products!: Table<IProduct>;

  constructor() {
    super('CalorieTrackerDB');
    this.version(1).stores({
      products: 'id, name',
    });
  }

  async searchProducts(query: string): Promise<IProduct[]> {
    const lowerQuery = query.toLowerCase();
    return this.products
      .where('name')
      .startsWithIgnoreCase(lowerQuery)
      .or('keywords')
      .startsWithIgnoreCase(lowerQuery)
      .toArray();
  }

  async putProduct(product: IProduct) {
    await this.products.put({
      ...product,
    });
  }

  async bulkPutProducts(products: IProduct[]) {
    const productsWithTimestamp = products.map((p) => ({
      ...p,
      lastUpdated: Date.now(),
    }));
    await this.products.bulkPut(productsWithTimestamp);
  }
}

export const productDb = new ProductDatabase();
