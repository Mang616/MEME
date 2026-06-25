import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeDatabase } from "./db/normalize-database.js";
import type { Database } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_FILE = path.resolve(__dirname, "../seed/initial.json");

export async function loadSeedDatabase(): Promise<Database> {
  const raw = await readFile(SEED_FILE, "utf8");
  return normalizeDatabase(JSON.parse(raw) as Partial<Database>);
}
