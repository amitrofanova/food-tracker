import { db } from '@/shared/db';
import type { IProduct } from '@/entities/product';
import {
  fetchCustomProducts,
  upsertCustomProduct,
  deleteCustomProduct as deleteCustomProductApi,
} from '@/shared/api/customProducts';
import { useUserStore } from '@/entities/user';

const isAuthenticated = () => !!localStorage.getItem('token');

export function useCustomProducts() {
  const products = ref<IProduct[]>([]);
  const isLoading = ref(false);
  const userStore = useUserStore();

  const loadAll = async () => {
    isLoading.value = true;
    try {
      if (isAuthenticated()) {
        try {
          const serverProducts = await fetchCustomProducts();
          await db.customProducts.clear();
          if (serverProducts.length) await db.customProducts.bulkPut(serverProducts);
          products.value = serverProducts;
        } catch {
          products.value = await db.getAllCustomProducts();
        }
      } else {
        products.value = await db.getAllCustomProducts();
      }
    } finally {
      isLoading.value = false;
    }
  };

  const remove = async (id: string) => {
    if (isAuthenticated()) {
      await deleteCustomProductApi(id);
    }
    await db.deleteCustomProduct(id);
    products.value = products.value.filter((p) => p.id !== id);
  };

  const save = async (product: IProduct) => {
    if (isAuthenticated()) {
      const saved = await upsertCustomProduct(product);
      await db.putCustomProduct(saved);
      const idx = products.value.findIndex((p) => p.id === saved.id);
      if (idx >= 0) products.value[idx] = saved;
      else products.value.push(saved);
    } else {
      await db.putCustomProduct(product);
      const idx = products.value.findIndex((p) => p.id === product.id);
      if (idx >= 0) products.value[idx] = product;
      else products.value.push(product);
    }
  };

  onMounted(loadAll);
  watch(() => userStore.syncVersion, loadAll);

  return { products, isLoading, loadAll, remove, save };
}
