import { db } from '@/shared/db';
import type { IProduct } from '@/entities/product';
import {
  fetchCustomProducts,
  upsertCustomProduct,
  deleteCustomProduct as deleteCustomProductApi,
} from '@/shared/api/customProducts';
import { useUserStore } from '@/entities/user';
import { useSyncedEntity } from '@/shared/lib/useSyncedEntity';
import { toRef } from 'vue';

export function useCustomProducts() {
  const userStore = useUserStore();

  const {
    items: products,
    isLoading,
    loadAll,
    save,
    remove,
  } = useSyncedEntity<IProduct>(
    {
      fetchServer: fetchCustomProducts,
      upsertServer: upsertCustomProduct,
      deleteServer: deleteCustomProductApi,
      getAllLocal: () => db.getAllCustomProducts(),
      clearLocal: () => db.customProducts.clear(),
      bulkPutLocal: (items) => db.customProducts.bulkPut(items),
      putLocal: (item) => db.putCustomProduct(item),
      deleteLocal: (id) => db.deleteCustomProduct(id),
    },
    toRef(userStore, 'syncVersion'),
  );

  return { products, isLoading, loadAll, remove, save };
}
