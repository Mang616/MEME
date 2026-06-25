import "dotenv/config";
/**
 * 手动灌库：npm run db:seed（需已配置 DATABASE_URL 并执行 db:push）
 */
import { loadSeedDatabase } from "../seed.js";
import { seedFromDatabase } from "../db/mysql-store.js";

const data = await loadSeedDatabase();
await seedFromDatabase(data);
console.log("OK: database seeded from seed/initial.json");
