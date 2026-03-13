import Dexie, { type Table } from 'dexie';
import type { IProduct } from '@/entities/product';

export class ProductDatabase extends Dexie {
  products!: Table<IProduct>;
  customProducts!: Table<IProduct>;

  constructor() {
    super('CalorieTrackerDB');
    this.version(1).stores({
      products: 'id, name',
    });
    this.version(2).stores({
      products: 'id, name',
      customProducts: 'id, name',
    });
  }

  async getProducts(query: string): Promise<IProduct[]> {
    const lowerQuery = query.toLowerCase();
    return this.products.where('name').startsWithIgnoreCase(lowerQuery).toArray();
  }

  async getCustomProducts(query: string): Promise<IProduct[]> {
    const lowerQuery = query.toLowerCase();
    return this.customProducts.where('name').startsWithIgnoreCase(lowerQuery).toArray();
  }

  async putProduct(product: IProduct) {
    await this.products.put(product);
  }

  async putCustomProduct(product: IProduct) {
    const customProduct: IProduct = {
      ...product,
    };
    await this.customProducts.put(customProduct);
    return customProduct;
  }
}

export const productDb = new ProductDatabase();
