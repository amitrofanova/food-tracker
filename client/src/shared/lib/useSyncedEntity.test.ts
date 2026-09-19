import { describe, expect, it, vi } from 'vitest';
import { mergeServerItemsPreservingLocalOnly, reconcileSyncedCollection } from './useSyncedEntity';

describe('mergeServerItemsPreservingLocalOnly', () => {
  it('keeps local ids that the server does not have', () => {
    expect(
      mergeServerItemsPreservingLocalOnly(
        [{ id: 'server', name: 'from-server' }],
        [
          { id: 'server', name: 'stale-cache' },
          { id: 'guest', name: 'offline' },
        ],
      ),
    ).toEqual([
      { id: 'server', name: 'from-server' },
      { id: 'guest', name: 'offline' },
    ]);
  });
});

describe('reconcileSyncedCollection', () => {
  it('does not persist a server-only snapshot that would wipe unsynced local rows', async () => {
    const clearLocal = vi.fn().mockResolvedValue(undefined);
    const bulkPutLocal = vi.fn().mockResolvedValue(undefined);

    const merged = await reconcileSyncedCollection({
      fetchServer: async () => [{ id: 's1' }],
      getAllLocal: async () => [{ id: 's1' }, { id: 'guest-1' }],
      clearLocal,
      bulkPutLocal,
    });

    expect(merged.map((item) => item.id)).toEqual(['s1', 'guest-1']);
    expect(clearLocal).toHaveBeenCalledTimes(1);
    expect(bulkPutLocal).toHaveBeenCalledWith([{ id: 's1' }, { id: 'guest-1' }]);
  });

  it('does not clear local data if the server fetch fails', async () => {
    const clearLocal = vi.fn().mockResolvedValue(undefined);
    const bulkPutLocal = vi.fn().mockResolvedValue(undefined);

    await expect(
      reconcileSyncedCollection({
        fetchServer: async () => {
          throw new Error('offline');
        },
        getAllLocal: async () => [{ id: 'guest-1' }],
        clearLocal,
        bulkPutLocal,
      }),
    ).rejects.toThrow('offline');

    expect(clearLocal).not.toHaveBeenCalled();
    expect(bulkPutLocal).not.toHaveBeenCalled();
  });
});
