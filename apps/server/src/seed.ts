import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Database } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_FILE = path.resolve(__dirname, "../seed/initial.json");

export async function loadSeedDatabase(): Promise<Database> {
  const raw = await readFile(SEED_FILE, "utf8");
  const data = JSON.parse(raw) as Database;
  return {
    orders: data.orders.map((order) => ({ ...order, product: { ...order.product } })),
    products: data.products.map((product) => ({
      ...product,
      published: product.published ?? true,
    })),
    handlers: data.handlers.map((handler) => ({ ...handler })),
    categories: data.categories,
  };
}
