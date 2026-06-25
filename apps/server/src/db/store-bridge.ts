import { USE_MYSQL } from "../config.js";

/** JSON / MySQL 双存储：按运行时配置选用对应实现 */
export function pickStore<T>(mysqlImpl: T, jsonImpl: T): T {
  return USE_MYSQL ? mysqlImpl : jsonImpl;
}

export function storageLabel() {
  return USE_MYSQL ? "mysql" : "json";
}
