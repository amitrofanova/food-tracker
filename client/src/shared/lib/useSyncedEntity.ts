import { onMounted, ref, watch, type Ref } from "vue";
import { isAuthenticated } from "./auth";

interface SyncedEntityOptions<T extends { id: string }> {
  fetchServer: () => Promise<T[]>;
  upsertServer: (item: T) => Promise<T>;
  deleteServer: (id: string) => Promise<unknown>;
  getAllLocal: () => Promise<T[]>;
  clearLocal: () => Promise<unknown>;
  bulkPutLocal: (items: T[]) => Promise<unknown>;
  putLocal: (item: T) => Promise<unknown>;
  deleteLocal: (id: string) => Promise<unknown>;
}

/** Keep local-only rows (guest / unsynced) when replacing the cache from the server. */
export function mergeServerItemsPreservingLocalOnly<T extends { id: string }>(
  serverItems: T[],
  localItems: T[],
): T[] {
  const serverIds = new Set(serverItems.map((item) => item.id));
  const localOnly = localItems.filter((item) => !serverIds.has(item.id));
  return [...serverItems, ...localOnly];
}

export async function reconcileSyncedCollection<T extends { id: string }>(
  options: Pick<
    SyncedEntityOptions<T>,
    "fetchServer" | "getAllLocal" | "clearLocal" | "bulkPutLocal"
  >,
): Promise<T[]> {
  const serverItems = await options.fetchServer();
  const localItems = await options.getAllLocal();
  const merged = mergeServerItemsPreservingLocalOnly(serverItems, localItems);
  await options.clearLocal();
  if (merged.length) await options.bulkPutLocal(merged);
  return merged;
}

export function useSyncedEntity<T extends { id: string }>(
  options: SyncedEntityOptions<T>,
  syncVersion?: Ref<number>,
) {
  const items = ref<T[]>([]) as Ref<T[]>;
  const isLoading = ref(false);

  const loadAll = async (): Promise<void> => {
    isLoading.value = true;
    try {
      if (isAuthenticated()) {
        try {
          items.value = await reconcileSyncedCollection(options);
        } catch {
          items.value = await options.getAllLocal();
        }
      } else {
        items.value = await options.getAllLocal();
      }
    } finally {
      isLoading.value = false;
    }
  };

  const save = async (item: T): Promise<void> => {
    const toSave = isAuthenticated() ? await options.upsertServer(item) : item;
    await options.putLocal(toSave);
    const idx = items.value.findIndex((i) => i.id === toSave.id);
    if (idx >= 0) items.value.splice(idx, 1, toSave);
    else items.value.push(toSave);
  };

  const remove = async (id: string): Promise<void> => {
    if (isAuthenticated()) await options.deleteServer(id);
    await options.deleteLocal(id);
    items.value = items.value.filter((i) => i.id !== id);
  };

  onMounted(loadAll);
  if (syncVersion) watch(syncVersion, loadAll);

  return { items, isLoading, loadAll, save, remove };
}
