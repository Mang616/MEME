/**
 * 一次性执行：打手档案迁移 + RBAC 打手默认权限
 * 用法: npm run db:migrate-handlers --prefix apps/server
 */
import {
  ensureHandlerLegacyProfiles,
  ensureOrderServiceTypes,
  ensureRbacHandlerDefaults,
} from "../db/seed.js";
import { rolePermissionService } from "../services/role-permissions.js";
import { storageLabel } from "../db/index.js";

async function main() {
  console.log(`[migrate-handlers] storage: ${storageLabel()}`);
  const profiles = await ensureHandlerLegacyProfiles();
  const orders = await ensureOrderServiceTypes();
  const rbac = await ensureRbacHandlerDefaults();
  await rolePermissionService.load();
  console.log(
    `[migrate-handlers] done (profiles=${profiles ? "updated" : "ok"}, orders=${orders ? "updated" : "ok"}, rbac=${rbac ? "reset" : "ok"})`,
  );
}

main().catch((err) => {
  console.error("[migrate-handlers] failed:", err);
  process.exit(1);
});
