import Dexie, { type Table } from 'dexie';
import type { IUser } from '@/entities/user';

export class UserDatabase extends Dexie {
  users!: Table<IUser>;

  constructor() {
    super('CalorieTrackerDB');
    this.version(2).stores({
      users: 'id, name',
    });
  }

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
      await this.users.put({ id: Date.now(), name, calorieBudget });
    }
  }
}

export const userDb = new UserDatabase();
