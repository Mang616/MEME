import { USE_MYSQL } from "../config.js";
import { loadSeedDatabase } from "../seed.js";
import { withCmsDefaults } from "./cms-defaults.js";
import * as mysqlStore from "./mysql-store.js";
import * as jsonStore from "./json-store.js";

/** 空库时从 seed/initial.json 灌入（MySQL 或 JSON） */
export async function seedDatabaseIfEmpty() {
  if (USE_MYSQL) {
    if (!(await mysqlStore.isEmpty())) return false;
    const data = await loadSeedDatabase();
    await mysqlStore.seedFromDatabase(data);
    console.log("[meme-server] MySQL seeded from seed/initial.json");
    return true;
  }

  await jsonStore.readDb();
  console.log("[meme-server] JSON store ready (data/db.json)");
  return false;
}

/** 已有业务数据但 CMS 表为空时补种默认用户 / Banner / 公告 */
export async function ensureCmsSeeded() {
  if (USE_MYSQL) {
    if (!(await mysqlStore.isCmsIncomplete())) return false;
    const cms = withCmsDefaults({});
    await mysqlStore.seedCmsMissing(cms);
    console.log("[meme-server] CMS defaults seeded (users, banners, announcements)");
    return true;
  }

  const db = await jsonStore.readDb();
  if (db.users.length > 0 && db.banners.length > 0 && db.announcements.length > 0) {
    return false;
  }
  await jsonStore.updateDb((draft) => {
    const cms = withCmsDefaults(draft);
    if (!draft.users.length) draft.users = cms.users;
    if (!draft.banners.length) draft.banners = cms.banners;
    if (!draft.announcements.length) draft.announcements = cms.announcements;
  });
  return true;
}
