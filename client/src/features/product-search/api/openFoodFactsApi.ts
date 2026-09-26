import axios from "axios";
import { http } from "@/shared/api";
import type { OpenFoodFactsProduct } from "../model/mappers";

export interface OpenFoodFactsResponse {
  products: OpenFoodFactsProduct[];
  page: number;
  page_count: number;
  page_size: number;
  count: number;
}

function rethrowOffError(err: unknown): never {
  if (axios.isAxiosError(err) && (err.response?.status === 502 || err.code === "ERR_NETWORK")) {
    throw new Error("Каталог продуктов временно недоступен");
  }
  throw err;
}

export async function searchProducts(query: string, page = 1): Promise<OpenFoodFactsResponse> {
  try {
    const { data } = await http.get<OpenFoodFactsResponse>("/products/search", {
      params: { q: query.trim(), page },
    });
    return {
      products: data.products ?? [],
      page: data.page ?? page,
      page_count: data.page_count ?? 0,
      page_size: data.page_size ?? 20,
      count: data.count ?? 0,
    };
  } catch (err) {
    rethrowOffError(err);
  }
}

export async function getProductByBarcode(barcode: string): Promise<OpenFoodFactsProduct | null> {
  try {
    const { data } = await http.get<{ status?: number; product?: OpenFoodFactsProduct }>(
      `/products/barcode/${encodeURIComponent(barcode)}`,
    );
    if (data.status !== 1 || !data.product) return null;
    return data.product;
  } catch (err) {
    rethrowOffError(err);
  }
}
