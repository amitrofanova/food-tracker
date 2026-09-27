import { FastifyInstance } from "fastify";
import {
  searchProducts,
  getProductByBarcode,
} from "../controllers/productSearchController";

export default async function productRoutes(fastify: FastifyInstance) {
  fastify.get("/search", searchProducts);
  fastify.get("/barcode/:barcode", getProductByBarcode);
}
