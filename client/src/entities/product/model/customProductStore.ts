import { defineStore } from "pinia";
import { watch } from "vue";
import {
  deleteCustomProduct,
  fetchCustomProducts,
  upsertCustomProduct,
} from "@/shared/api";
import { db } from "@/shared/db";
import { dataSyncVersion } from "@/shared/lib/dataSync";
import { useSyncedEntity } from "@/shared/lib/useSyncedEntity";
import type { IProduct } from "./types";

export const useCustomProductStore = defineStore("custom-products", () => {
  const { items, isLoading, loadAll, save, remove } = useSyncedEntity<IProduct>(
    {
      fetchServer: fetchCustomProducts,
      upsertServer: upsertCustomProduct,
      deleteServer: deleteCustomProduct,
      getAllLocal: () => db.getAllCustomProducts(),
      clearLocal: () => db.customProducts.clear(),
      bulkPutLocal: (products) => db.customProducts.bulkPut(products),
      putLocal: (product) => db.putCustomProduct(product),
      deleteLocal: (id) => db.deleteCustomProduct(id),
    },
    { bindLifecycle: false },
  );

  watch(dataSyncVersion, () => {
    void loadAll();
  });
  void loadAll();

  return {
    products: items,
    isLoading,
    loadAll,
    save,
    remove,
  };
});
