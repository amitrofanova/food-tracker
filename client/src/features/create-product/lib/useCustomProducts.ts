import { storeToRefs } from "pinia";
import { useCustomProductStore } from "@/entities/product";

export function useCustomProducts() {
  const store = useCustomProductStore();
  const { products, isLoading } = storeToRefs(store);

  return {
    products,
    isLoading,
    loadAll: store.loadAll,
    save: store.save,
    remove: store.remove,
  };
}
