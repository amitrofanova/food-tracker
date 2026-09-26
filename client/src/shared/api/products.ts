import { http } from "./http";
import type { ProductDto } from "@/shared/model";

export async function upsertProduct(product: ProductDto): Promise<ProductDto> {
  const { data } = await http.post<ProductDto>("/products", product);
  return data;
}
