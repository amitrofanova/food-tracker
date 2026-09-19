import Dexie, { type Table } from 'dexie';
import type { DiaryEntryDto, ProductDto, RecipeDto, UserDto } from '@/shared/model';

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

function validateUser(user: UserDto): void {
  assertNonNegativeNumber(user.id, 'User id');
  assertNonEmptyString(user.email, 'User email');
}

function validateProduct(product: ProductDto): void {
  assertNonEmptyString(product.id, 'Product id');
  assertNonEmptyString(product.name, 'Product name');
  assertNonNegativeNumber(product.calories, 'Product calories');
  assertNonNegativeNumber(product.protein, 'Product protein');
  assertNonNegativeNumber(product.fat, 'Product fat');
  assertNonNegativeNumber(product.carbs, 'Product carbs');
}

function validateDiaryEntry(entry: DiaryEntryDto): void {
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
  entries!: Table<DiaryEntryDto, string>;
  products!: Table<ProductDto, string>;
  customProducts!: Table<ProductDto, string>;
  users!: Table<UserDto, string>;
  recipes!: Table<RecipeDto, string>;

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
    this.version(3).stores({
      products: 'id, name',
      customProducts: 'id, name',
      users: 'id, name',
      entries: 'id, date, mealType, productId',
      recipes: 'id, name',
    });
  }

  // Diary
  async saveEntry(entry: DiaryEntryDto): Promise<void> {
    try {
      validateDiaryEntry(entry);
      await this.entries.put(entry);
    } catch (error) {
      console.error('Failed to save entry:', error);
      throw new Error(
        `Ошибка сохранения записи: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
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
        `Ошибка удаления записи: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      );
    }
  }

  async getAllEntries(): Promise<DiaryEntryDto[]> {
    try {
      return await this.entries.toArray();
    } catch (error) {
      console.error('Failed to load entries:', error);
      throw new Error(
        `Ошибка загрузки записей: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      );
    }
  }

  // Product
  async getProducts(query: string): Promise<ProductDto[]> {
    try {
      const lowerQuery = query.toLowerCase();
      return await this.products.where('name').startsWithIgnoreCase(lowerQuery).toArray();
    } catch (error) {
      console.error('Failed to get products:', error);
      throw new Error(
        `Ошибка получения продуктов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      );
    }
  }

  async getCustomProducts(query: string): Promise<ProductDto[]> {
    try {
      const lowerQuery = query.toLowerCase();
      return await this.customProducts.where('name').startsWithIgnoreCase(lowerQuery).toArray();
    } catch (error) {
      console.error('Failed to get custom products:', error);
      throw new Error(
        `Ошибка получения пользовательских продуктов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      );
    }
  }

  async getAllCustomProducts(): Promise<ProductDto[]> {
    try {
      return await this.customProducts.toArray();
    } catch (error) {
      console.error('Failed to load custom products:', error);
      throw new Error(
        `Ошибка загрузки пользовательских продуктов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      );
    }
  }

  async deleteCustomProduct(id: string): Promise<void> {
    try {
      assertNonEmptyString(id, 'Product id');
      await this.customProducts.delete(id);
    } catch (error) {
      console.error('Failed to delete custom product:', error);
      throw new Error(
        `Ошибка удаления продукта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      );
    }
  }

  async putProduct(product: ProductDto): Promise<void> {
    try {
      validateProduct(product);
      await this.products.put(product);
    } catch (error) {
      console.error('Failed to save product:', error);
      throw new Error(
        `Ошибка сохранения продукта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      );
    }
  }

  async putCustomProduct(product: ProductDto): Promise<ProductDto> {
    try {
      validateProduct(product);
      const customProduct = { ...product };
      await this.customProducts.put(customProduct);
      return customProduct;
    } catch (error) {
      console.error('Failed to save custom product:', error);
      throw new Error(
        `Ошибка сохранения продукта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      );
    }
  }

  // User
  async saveUser(user: UserDto): Promise<void> {
    try {
      validateUser(user);
      const plainUser = { ...user };
      await this.users.put(plainUser);
    } catch (error) {
      console.error('Failed to save user:', error);
      throw new Error(
        `Ошибка сохранения пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      );
    }
  }

  async getUser(name: string): Promise<UserDto | undefined> {
    try {
      assertNonEmptyString(name, 'User name');
      return await this.users.where('name').equals(name).first();
    } catch (error) {
      console.error('Failed to get user:', error);
      throw new Error(
        `Ошибка получения пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      );
    }
  }

  async updateCalorieBudget(id: string, calorieBudget: number): Promise<void> {
    try {
      assertNonEmptyString(id, 'User id');
      assertPositiveNumber(calorieBudget, 'Calorie budget');
      const updated = await this.users.update(id, { calorieBudget });
      if (updated === 0) {
        throw new Error('Пользователь не найден');
      }
    } catch (error) {
      console.error('Failed to update calorie budget:', error);
      throw new Error(
        `Ошибка обновления нормы калорий: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      );
    }
  }

  // Recipes
  async getAllRecipes(): Promise<RecipeDto[]> {
    try {
      return await this.recipes.toArray();
    } catch (error) {
      console.error('Failed to load recipes:', error);
      throw new Error(
        `Ошибка загрузки рецептов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      );
    }
  }

  async putRecipe(recipe: RecipeDto): Promise<void> {
    try {
      assertNonEmptyString(recipe.id, 'Recipe id');
      assertNonEmptyString(recipe.name, 'Recipe name');
      await this.recipes.put(recipe);
    } catch (error) {
      console.error('Failed to save recipe:', error);
      throw new Error(
        `Ошибка сохранения рецепта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      );
    }
  }

  async deleteRecipe(id: string): Promise<void> {
    try {
      assertNonEmptyString(id, 'Recipe id');
      await this.recipes.delete(id);
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      throw new Error(
        `Ошибка удаления рецепта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      );
    }
  }
}

export const db = new CalorieTrackerDB();
