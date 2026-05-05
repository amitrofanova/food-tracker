import { db } from '@/shared/db';
import type { IProduct } from '@/entities/product';
import { upsertProduct } from '@/shared/api/products';

const isAuthenticated = () => !!localStorage.getItem('token');

export function useCustomProducts() {
  const products = ref<IProduct[]>([]);
  const isLoading = ref(false);

  const loadAll = async () => {
    isLoading.value = true;
    try {
      products.value = await db.getAllCustomProducts();
    } finally {
      isLoading.value = false;
    }
  };

  const remove = async (id: string) => {
    await db.deleteCustomProduct(id);
    products.value = products.value.filter((p) => p.id !== id);
    // Products are not deleted from Postgres — they may be referenced by diary entries
  };

  const save = async (product: IProduct) => {
    await db.putCustomProduct(product);
    if (isAuthenticated()) {
      await upsertProduct(product);
    }
    const idx = products.value.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      products.value[idx] = product;
    } else {
      products.value.push(product);
    }
  };

  onMounted(loadAll);

  return { products, isLoading, loadAll, remove, save };
}
