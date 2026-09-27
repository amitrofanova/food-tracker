import type { IProduct } from "@/entities/product";
import { useCustomProductStore } from "@/entities/product";
import { extractErrorMessage } from "@/shared/lib/error";

export function useCreateProduct() {
  const store = useCustomProductStore();
  const error = ref<string | null>(null);

  const createProduct = async (formData: IProduct): Promise<IProduct> => {
    try {
      error.value = null;
      await store.save(formData);
      return formData;
    } catch (err) {
      error.value = extractErrorMessage(err, "Ошибка создания продукта");
      console.error("Failed to create product:", err);
      throw err;
    }
  };

  return { createProduct, error };
}
