import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { DATABASE_URL } from "../config.js";
import * as schema from "./schema.js";

let pool: mysql.Pool | null = null;

function createMysqlDb() {
  return drizzle(getMysqlPool(), { schema, mode: "default" });
}

let db: ReturnType<typeof createMysqlDb> | undefined;

export function getMysqlPool() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!pool) {
    pool = mysql.createPool(DATABASE_URL);
  }
  return pool;
}

export function getMysqlDb() {
  if (!db) {
    db = createMysqlDb();
  }
  return db;
}
