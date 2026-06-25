import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSeedDatabase } from "../seed.js";
import { normalizeDatabase } from "./normalize-database.js";
import type { Database } from "../types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_FILE = path.join(DATA_DIR, "db.json");

let cache: Database | null = null;

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readDb(): Promise<Database> {
  if (cache) return cache;
  await ensureDataDir();

  try {
    const raw = await readFile(DB_FILE, "utf8");
    cache = normalizeDatabase(JSON.parse(raw) as Partial<Database>);
    return cache;
  } catch {
    cache = await loadSeedDatabase();
    await writeDb(cache);
    return cache;
  }
}

export async function writeDb(next: Database) {
  cache = next;
  await ensureDataDir();
  await writeFile(DB_FILE, JSON.stringify(next, null, 2), "utf8");
}

export async function updateDb(mutator: (db: Database) => void) {
  const db = await readDb();
  mutator(db);
  await writeDb(db);
  return db;
}

export function storageLabel() {
  return "json";
}
