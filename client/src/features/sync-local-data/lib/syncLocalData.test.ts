import { describe, expect, it, vi } from 'vitest';
import {
  createLocalDataSyncer,
  formatPendingLocalSummary,
  LocalDataSyncAborted,
  messageFromSyncError,
  pendingLocalTotal,
  selectPendingByServerIds,
  type SyncLocalDataDeps,
} from './syncLocalData';

function item(id: string) {
  return { id };
}

function createDeps(overrides: Partial<SyncLocalDataDeps> = {}): SyncLocalDataDeps {
  return {
    getCustomProducts: vi.fn().mockResolvedValue([]),
    getRecipes: vi.fn().mockResolvedValue([]),
    getEntries: vi.fn().mockResolvedValue([]),
    getServerCustomProducts: vi.fn().mockResolvedValue([]),
    getServerRecipes: vi.fn().mockResolvedValue([]),
    upsertCustomProduct: vi.fn().mockResolvedValue({}),
    upsertRecipe: vi.fn().mockResolvedValue({}),
    saveDiaryEntry: vi.fn().mockResolvedValue({}),
    deleteCustomProduct: vi.fn().mockResolvedValue(undefined),
    deleteRecipe: vi.fn().mockResolvedValue(undefined),
    clearEntries: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('selectPendingByServerIds', () => {
  it('keeps only local ids that are not already on the server', () => {
    const pending = selectPendingByServerIds([item('guest'), item('cached')], new Set(['cached']));
    expect(pending).toEqual([item('guest')]);
  });

  it('treats all local rows as pending when the server catalog is unknown', () => {
    expect(selectPendingByServerIds([item('a'), item('b')], undefined)).toEqual([
      item('a'),
      item('b'),
    ]);
  });
});

describe('pending copy', () => {
  it('counts entries, products and recipes together', () => {
    expect(pendingLocalTotal({ entries: 2, products: 1, recipes: 3 })).toBe(6);
  });

  it('formats a Russian summary', () => {
    expect(formatPendingLocalSummary({ entries: 1, products: 2, recipes: 5 })).toBe(
      '1 запись дневника, 2 продукта, 5 рецептов',
    );
  });
});

describe('messageFromSyncError', () => {
  it('prefers an API error payload', () => {
    expect(
      messageFromSyncError({ response: { data: { error: 'Вес должен быть больше 0' } } }),
    ).toBe('Вес должен быть больше 0');
  });
});

describe('createLocalDataSyncer', () => {
  it('does not clear local entries when a later POST fails', async () => {
    const deps = createDeps({
      getCustomProducts: vi.fn().mockResolvedValue([item('p1'), item('p2')]),
      upsertCustomProduct: vi
        .fn()
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('second product failed')),
      getEntries: vi.fn().mockResolvedValue([item('e1')]),
    });
    const syncer = createLocalDataSyncer(deps);

    await expect(syncer.confirmSync()).rejects.toBeInstanceOf(LocalDataSyncAborted);
    expect(deps.upsertCustomProduct).toHaveBeenCalledTimes(2);
    expect(deps.saveDiaryEntry).not.toHaveBeenCalled();
    expect(deps.clearEntries).not.toHaveBeenCalled();
  });

  it('replays remaining diary entries by stable id after a partial abort', async () => {
    const deps = createDeps({
      getEntries: vi.fn().mockResolvedValue([item('e1'), item('e2')]),
      saveDiaryEntry: vi
        .fn()
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('second entry failed'))
        .mockResolvedValueOnce({}),
    });
    const syncer = createLocalDataSyncer(deps);

    await expect(syncer.confirmSync()).rejects.toMatchObject({
      message: 'second entry failed',
    });
    expect(deps.saveDiaryEntry).toHaveBeenCalledTimes(2);
    expect(deps.clearEntries).not.toHaveBeenCalled();
    expect(syncer.postedEntryIds.has('e1')).toBe(true);
    expect(syncer.postedEntryIds.has('e2')).toBe(false);

    await syncer.confirmSync();

    expect(deps.saveDiaryEntry).toHaveBeenCalledTimes(3);
    expect(deps.saveDiaryEntry).toHaveBeenNthCalledWith(3, item('e2'));
    expect(deps.clearEntries).toHaveBeenCalledTimes(1);
    expect(syncer.postedEntryIds.size).toBe(0);
  });

  it('includes products and recipes in pendingCount, not only diary entries', async () => {
    const deps = createDeps({
      getCustomProducts: vi.fn().mockResolvedValue([item('p1')]),
      getRecipes: vi.fn().mockResolvedValue([item('r1'), item('r2')]),
      getEntries: vi.fn().mockResolvedValue([item('e1')]),
    });
    const syncer = createLocalDataSyncer(deps);

    await expect(syncer.pendingCounts()).resolves.toEqual({
      entries: 1,
      products: 1,
      recipes: 2,
    });
    expect(pendingLocalTotal(await syncer.pendingCounts())).toBe(4);
  });

  it('upserts only products and recipes that are not already on the server', async () => {
    const deps = createDeps({
      getCustomProducts: vi.fn().mockResolvedValue([item('guest-p'), item('cached-p')]),
      getRecipes: vi.fn().mockResolvedValue([item('guest-r'), item('cached-r')]),
      getServerCustomProducts: vi.fn().mockResolvedValue([item('cached-p')]),
      getServerRecipes: vi.fn().mockResolvedValue([item('cached-r')]),
    });
    const syncer = createLocalDataSyncer(deps);

    expect(await syncer.pendingCounts()).toEqual({
      entries: 0,
      products: 1,
      recipes: 1,
    });

    await syncer.confirmSync();

    expect(deps.upsertCustomProduct).toHaveBeenCalledTimes(1);
    expect(deps.upsertCustomProduct).toHaveBeenCalledWith(item('guest-p'));
    expect(deps.upsertRecipe).toHaveBeenCalledTimes(1);
    expect(deps.upsertRecipe).toHaveBeenCalledWith(item('guest-r'));
    expect(deps.clearEntries).toHaveBeenCalledTimes(1);
  });

  it('discards unsynced products and recipes without deleting the server cache', async () => {
    const deps = createDeps({
      getCustomProducts: vi.fn().mockResolvedValue([item('guest-p'), item('cached-p')]),
      getRecipes: vi.fn().mockResolvedValue([item('cached-r')]),
      getEntries: vi.fn().mockResolvedValue([item('e1')]),
      getServerCustomProducts: vi.fn().mockResolvedValue([item('cached-p')]),
      getServerRecipes: vi.fn().mockResolvedValue([item('cached-r')]),
    });
    const syncer = createLocalDataSyncer(deps);

    await syncer.discardLocal();

    expect(deps.deleteCustomProduct).toHaveBeenCalledTimes(1);
    expect(deps.deleteCustomProduct).toHaveBeenCalledWith('guest-p');
    expect(deps.deleteRecipe).not.toHaveBeenCalled();
    expect(deps.clearEntries).toHaveBeenCalledTimes(1);
  });
});
