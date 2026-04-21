import Dexie, { type Table } from 'dexie';
import type { IDiaryEntry } from '@/entities/diary-entry';
import type { IProduct } from '@/entities/product';
import type { IUser } from '@/entities/user';

function assertNonEmptyString(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required and must be a non-empty string`);
  }
}

function assertPositiveNumber(value: unknown, field: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${field} must be a positive number`);
  }
}

function assertNonNegativeNumber(value: unknown, field: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a non-negative number`);
  }
}

function validateUser(user: IUser): void {
  assertNonNegativeNumber(user.id, 'User id');
  assertNonEmptyString(user.email, 'User email');
}

function validateProduct(product: IProduct): void {
  assertNonEmptyString(product.id, 'Product id');
  assertNonEmptyString(product.name, 'Product name');
  assertNonNegativeNumber(product.calories, 'Product calories');
  assertNonNegativeNumber(product.protein, 'Product protein');
  assertNonNegativeNumber(product.fat, 'Product fat');
  assertNonNegativeNumber(product.carbs, 'Product carbs');
}

function validateDiaryEntry(entry: IDiaryEntry): void {
  assertNonEmptyString(entry.id, 'Diary entry id');
  assertNonEmptyString(entry.date, 'Diary entry date');
  assertNonEmptyString(entry.productId, 'Diary entry productId');
  assertNonEmptyString(entry.productName, 'Diary entry productName');
  assertNonEmptyString(entry.mealType, 'Diary entry mealType');
  assertPositiveNumber(entry.weight, 'Diary entry weight');
  assertNonNegativeNumber(entry.calories, 'Diary entry calories');
  assertNonNegativeNumber(entry.protein, 'Diary entry protein');
  assertNonNegativeNumber(entry.fat, 'Diary entry fat');
  assertNonNegativeNumber(entry.carbs, 'Diary entry carbs');
}

export class CalorieTrackerDB extends Dexie {
  entries!: Table<IDiaryEntry, string>;
  products!: Table<IProduct, string>;
  customProducts!: Table<IProduct, string>;
  users!: Table<IUser, string>;

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
    try {
      validateDiaryEntry(entry);
      await this.entries.put(entry);
    } catch (error) {
      console.error('Failed to save entry:', error);
      throw new Error(
        `Failed to save entry: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async deleteEntry(id: string): Promise<void> {
    try {
      assertNonEmptyString(id, 'Diary entry id');
      await this.entries.delete(id);
    } catch (error) {
      console.error('Failed to delete entry:', error);
      throw new Error(
        `Failed to delete entry: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getAllEntries(): Promise<IDiaryEntry[]> {
    try {
      return await this.entries.toArray();
    } catch (error) {
      console.error('Failed to load entries:', error);
      throw new Error(
        `Failed to load entries: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Product
  async getProducts(query: string): Promise<IProduct[]> {
    try {
      const lowerQuery = query.toLowerCase();
      return await this.products.where('name').startsWithIgnoreCase(lowerQuery).toArray();
    } catch (error) {
      console.error('Failed to get products:', error);
      throw new Error(
        `Failed to get products: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getCustomProducts(query: string): Promise<IProduct[]> {
    try {
      const lowerQuery = query.toLowerCase();
      return await this.customProducts.where('name').startsWithIgnoreCase(lowerQuery).toArray();
    } catch (error) {
      console.error('Failed to get custom products:', error);
      throw new Error(
        `Failed to get custom products: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async putProduct(product: IProduct): Promise<void> {
    try {
      validateProduct(product);
      await this.products.put(product);
    } catch (error) {
      console.error('Failed to save product:', error);
      throw new Error(
        `Failed to save product: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async putCustomProduct(product: IProduct): Promise<IProduct> {
    try {
      validateProduct(product);
      const customProduct = { ...product };
      await this.customProducts.put(customProduct);
      return customProduct;
    } catch (error) {
      console.error('Failed to save custom product:', error);
      throw new Error(
        `Failed to save custom product: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // User
  async saveUser(user: IUser): Promise<void> {
    try {
      validateUser(user);
      const plainUser = { ...user };
      await this.users.put(plainUser);
    } catch (error) {
      console.error('Failed to save user:', error);
      throw new Error(
        `Failed to save user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getUser(name: string): Promise<IUser | undefined> {
    try {
      assertNonEmptyString(name, 'User name');
      const user = await this.users.where('name').equals(name).first();
      if (user) {
        let userId = user.id;
        if (typeof userId !== 'string') {
          userId = userId == null ? Date.now().toString() : String(userId);
        }

        if (!userId.trim()) {
          userId = Date.now().toString();
        }

        if (user.id !== userId) {
          user.id = userId;
          await this.users.put(user);
        }
      }
      return user;
    } catch (error) {
      console.error('Failed to get user:', error);
      throw new Error(
        `Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async updateCalorieBudget(id: string, calorieBudget: number): Promise<void> {
    try {
      assertNonEmptyString(id, 'User id');
      assertPositiveNumber(calorieBudget, 'Calorie budget');
      const updated = await this.users.update(id, { calorieBudget });
      if (updated === 0) {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Failed to update calorie budget:', error);
      throw new Error(
        `Failed to update calorie budget: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

export const db = new CalorieTrackerDB();
