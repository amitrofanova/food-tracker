import Dexie, { type Table } from 'dexie';
import type { IDiaryEntry } from '@/entities/diary-entry';
import type { IProduct } from '@/entities/product';
import type { IUser } from '@/entities/user';

export class CalorieTrackerDB extends Dexie {
  entries!: Table<IDiaryEntry, string>;
  products!: Table<IProduct>;
  customProducts!: Table<IProduct>;
  users!: Table<IUser>;

  constructor() {
    super('CalorieTrackerDB');
    this.version(1).stores({
      products: 'id, name',
    });
    this.version(2).stores({
      products: 'id, name',
      customProducts: 'id, name',
      users: 'id, name',
      entries: 'id, date, mealType, productId',
    });
  }

  // Diary
  async saveEntry(entry: IDiaryEntry): Promise<void> {
    await this.entries.put(entry);
  }

  async deleteEntry(id: string): Promise<void> {
    await this.entries.delete(id);
  }

  async getAllEntries(): Promise<IDiaryEntry[]> {
    return this.entries.toArray();
  }

  // Product
  async getProducts(query: string): Promise<IProduct[]> {
    const lowerQuery = query.toLowerCase();
    return this.products.where('name').startsWithIgnoreCase(lowerQuery).toArray();
  }

  async getCustomProducts(query: string): Promise<IProduct[]> {
    const lowerQuery = query.toLowerCase();
    return this.customProducts.where('name').startsWithIgnoreCase(lowerQuery).toArray();
  }

  async putProduct(product: IProduct): Promise<void> {
    await this.products.put(product);
  }

  async putCustomProduct(product: IProduct): Promise<IProduct> {
    const customProduct = { ...product };
    await this.customProducts.put(customProduct);
    return customProduct;
  }

  // User
  async saveUser(user: IUser): Promise<void> {
    const plainUser = { ...user };
    await this.users.put(plainUser);
  }

  async getUser(name: string): Promise<IUser | undefined> {
    return this.users.where('name').equals(name).first();
  }

  async updateCalorieBudget(name: string, calorieBudget: number): Promise<void> {
    const user = await this.getUser(name);
    if (user) {
      await this.users.update(user.id, { calorieBudget });
    } else {
      await this.users.put({ id: Date.now(), name, calorieBudget } as IUser);
    }
  }
}

export const db = new CalorieTrackerDB();
