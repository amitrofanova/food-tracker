import type { Ref } from 'vue';
import { isAuthenticated } from './auth';

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
          const serverItems = await options.fetchServer();
          await options.clearLocal();
          if (serverItems.length) await options.bulkPutLocal(serverItems);
          items.value = serverItems;
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
