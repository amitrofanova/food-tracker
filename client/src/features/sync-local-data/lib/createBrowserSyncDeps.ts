import { db } from '@/shared/db';
import type { IDiaryEntry } from '@/entities/diary-entry';
import type { IProduct } from '@/entities/product';
import type { IRecipe } from '@/entities/recipe';
import { fetchCustomProducts, upsertCustomProduct } from '@/shared/api/customProducts';
import { fetchRecipes, upsertRecipe } from '@/shared/api/recipes';
import { saveDiaryEntry, toEntryCreatePayload } from '@/shared/api/diary';
import { createLocalDataSyncer, type SyncLocalDataDeps } from './syncLocalData';

export function createBrowserSyncDeps(): SyncLocalDataDeps<IProduct, IRecipe, IDiaryEntry> {
  return {
    getCustomProducts: () => db.getAllCustomProducts(),
    getRecipes: () => db.getAllRecipes(),
    getEntries: () => db.getAllEntries(),
    getServerCustomProducts: fetchCustomProducts,
    getServerRecipes: fetchRecipes,
    upsertCustomProduct,
    upsertRecipe,
    saveDiaryEntry: (entry) => saveDiaryEntry(toEntryCreatePayload(entry)),
    deleteCustomProduct: (id) => db.deleteCustomProduct(id),
    deleteRecipe: (id) => db.deleteRecipe(id),
    clearEntries: () => db.entries.clear(),
  };
}

export function createBrowserLocalDataSyncer() {
  return createLocalDataSyncer(createBrowserSyncDeps());
}
