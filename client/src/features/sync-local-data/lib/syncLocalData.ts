export type PendingLocalCounts = {
  entries: number;
  products: number;
  recipes: number;
};

export type SyncableEntity = { id: string };

export type SyncLocalDataDeps<
  TProduct extends SyncableEntity = SyncableEntity,
  TRecipe extends SyncableEntity = SyncableEntity,
  TEntry extends SyncableEntity = SyncableEntity,
> = {
  getCustomProducts: () => Promise<TProduct[]>;
  getRecipes: () => Promise<TRecipe[]>;
  getEntries: () => Promise<TEntry[]>;
  getServerCustomProducts?: () => Promise<SyncableEntity[]>;
  getServerRecipes?: () => Promise<SyncableEntity[]>;
  upsertCustomProduct: (product: TProduct) => Promise<unknown>;
  upsertRecipe: (recipe: TRecipe) => Promise<unknown>;
  saveDiaryEntry: (entry: TEntry) => Promise<unknown>;
  deleteCustomProduct: (id: string) => Promise<unknown>;
  deleteRecipe: (id: string) => Promise<unknown>;
  clearEntries: () => Promise<unknown>;
};

export class LocalDataSyncAborted extends Error {
  readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'LocalDataSyncAborted';
    this.cause = cause;
  }
}

export function pendingLocalTotal(counts: PendingLocalCounts): number {
  return counts.entries + counts.products + counts.recipes;
}

export function ruPlural(n: number, one: string, few: string, many: string): string {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return one;
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
  return many;
}

export function formatPendingLocalSummary(counts: PendingLocalCounts): string {
  const parts: string[] = [];
  if (counts.entries > 0) {
    parts.push(
      `${counts.entries} ${ruPlural(counts.entries, 'запись дневника', 'записи дневника', 'записей дневника')}`,
    );
  }
  if (counts.products > 0) {
    parts.push(
      `${counts.products} ${ruPlural(counts.products, 'продукт', 'продукта', 'продуктов')}`,
    );
  }
  if (counts.recipes > 0) {
    parts.push(`${counts.recipes} ${ruPlural(counts.recipes, 'рецепт', 'рецепта', 'рецептов')}`);
  }
  return parts.join(', ');
}

export function messageFromSyncError(
  err: unknown,
  fallback = 'Не удалось синхронизировать локальные данные',
): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as { response?: { data?: { error?: unknown } } }).response?.data;
    if (typeof data?.error === 'string' && data.error.trim()) {
      return data.error;
    }
  }
  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }
  return fallback;
}

export function selectPendingByServerIds<T extends SyncableEntity>(
  localItems: T[],
  serverIds: Set<string> | undefined,
): T[] {
  if (!serverIds) return localItems;
  return localItems.filter((item) => !serverIds.has(item.id));
}

async function loadServerIds(
  loader: (() => Promise<SyncableEntity[]>) | undefined,
): Promise<Set<string> | undefined> {
  if (!loader) return undefined;
  const serverItems = await loader();
  return new Set(serverItems.map((item) => item.id));
}

export function createLocalDataSyncer<
  TProduct extends SyncableEntity = SyncableEntity,
  TRecipe extends SyncableEntity = SyncableEntity,
  TEntry extends SyncableEntity = SyncableEntity,
>(deps: SyncLocalDataDeps<TProduct, TRecipe, TEntry>) {
  const postedEntryIds = new Set<string>();

  async function collectPending(): Promise<{
    products: TProduct[];
    recipes: TRecipe[];
    entries: TEntry[];
    counts: PendingLocalCounts;
  }> {
    const [products, recipes, entries] = await Promise.all([
      deps.getCustomProducts(),
      deps.getRecipes(),
      deps.getEntries(),
    ]);

    let pendingProducts = products;
    let pendingRecipes = recipes;

    try {
      const [serverProductIds, serverRecipeIds] = await Promise.all([
        loadServerIds(deps.getServerCustomProducts),
        loadServerIds(deps.getServerRecipes),
      ]);
      pendingProducts = selectPendingByServerIds(products, serverProductIds);
      pendingRecipes = selectPendingByServerIds(recipes, serverRecipeIds);
    } catch {
      // Catalog unavailable: replay all local rows. Upserts are idempotent by id.
    }

    return {
      products: pendingProducts,
      recipes: pendingRecipes,
      entries,
      counts: {
        entries: entries.length,
        products: pendingProducts.length,
        recipes: pendingRecipes.length,
      },
    };
  }

  async function pendingCounts(): Promise<PendingLocalCounts> {
    const { counts } = await collectPending();
    return counts;
  }

  async function confirmSync(): Promise<void> {
    const { products, recipes, entries } = await collectPending();

    try {
      for (const product of products) {
        await deps.upsertCustomProduct(product);
      }
      for (const recipe of recipes) {
        await deps.upsertRecipe(recipe);
      }
      for (const entry of entries) {
        if (postedEntryIds.has(entry.id)) continue;
        await deps.saveDiaryEntry(entry);
        postedEntryIds.add(entry.id);
      }
    } catch (err) {
      if (err instanceof LocalDataSyncAborted) throw err;
      throw new LocalDataSyncAborted(messageFromSyncError(err), err);
    }

    await deps.clearEntries();
    postedEntryIds.clear();
  }

  async function discardLocal(): Promise<void> {
    const { products, recipes } = await collectPending();
    for (const product of products) {
      await deps.deleteCustomProduct(product.id);
    }
    for (const recipe of recipes) {
      await deps.deleteRecipe(recipe.id);
    }
    await deps.clearEntries();
    postedEntryIds.clear();
  }

  return { confirmSync, discardLocal, pendingCounts, postedEntryIds };
}
