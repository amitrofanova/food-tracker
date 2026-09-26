import { http } from "./http";
import type { ProductDto } from "@/shared/model";

export async function fetchCustomProducts(): Promise<ProductDto[]> {
  const { data } = await http.get<ProductDto[]>("/custom-products");
  return data;
}

export async function upsertCustomProduct(product: ProductDto): Promise<ProductDto> {
  const { data } = await http.post<ProductDto>("/custom-products", product);
  return data;
}

export async function deleteCustomProduct(id: string): Promise<void> {
  await http.delete(`/custom-products/${id}`);
}
