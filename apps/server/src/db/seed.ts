import { USE_MYSQL } from "../config.js";
import { DEFAULT_PRODUCT_TAGS } from "../constants/product-tags.js";
import { loadSeedDatabase } from "../seed.js";
import { withCmsDefaults } from "./cms-defaults.js";
import * as mysqlStore from "./mysql-store.js";
import * as jsonStore from "./json-store.js";
import type { ContentPage } from "../types.js";

/** 新增 CMS 内容页时在此登记，启动时自动补种 */
const REQUIRED_CONTENT_SLUGS = ["vip-activity", "coupons", "invite-activity"] as const;

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

/** 已有业务数据但 CMS 表为空时补种 */
export async function ensureCmsSeeded() {
  const data = await loadSeedDatabase();
  const cms = withCmsDefaults(data);

  if (USE_MYSQL) {
    if (!(await mysqlStore.isCmsIncomplete())) return false;
    await mysqlStore.seedCmsMissing(cms);
    console.log("[meme-server] CMS seeded (users, banners, announcements)");
    return true;
  }

  const db = await jsonStore.readDb();
  if (db.users.length > 0 && db.banners.length > 0 && db.announcements.length > 0) {
    return false;
  }
  await jsonStore.updateDb((draft) => {
    if (!draft.users.length) draft.users = cms.users;
    if (!draft.banners.length) draft.banners = cms.banners;
    if (!draft.announcements.length) draft.announcements = cms.announcements;
  });
  return true;
}

/** 评价 / 聊天 / 文案等内容表为空时补种 */
export async function ensureExtendedSeeded() {
  const data = await loadSeedDatabase();

  if (USE_MYSQL) {
    if (!(await mysqlStore.isExtendedContentIncomplete())) return false;
    await mysqlStore.seedExtendedContentMissing(data);
    console.log("[meme-server] Extended content seeded (reviews, chats, pages)");
    return true;
  }

  const db = await jsonStore.readDb();
  const needsContent = db.contentPages.length === 0 || db.productReviews.length === 0;
  if (!needsContent) return false;

  await jsonStore.updateDb((draft) => {
    if (!draft.contentPages.length) draft.contentPages = data.contentPages;
    if (!draft.productReviews.length) draft.productReviews = data.productReviews;
    if (!draft.chatConversations.length) {
      draft.chatConversations = data.chatConversations;
      draft.chatMessages = data.chatMessages;
    }
  });
  return true;
}

/** 已有库补种缺失的 CMS 内容页（如 vip-activity） */
export async function ensureMissingContentPages() {
  const data = await loadSeedDatabase();
  const pages = data.contentPages.filter((page) =>
    REQUIRED_CONTENT_SLUGS.includes(page.slug as (typeof REQUIRED_CONTENT_SLUGS)[number]),
  );
  if (!pages.length) return false;

  let seeded = false;
  for (const page of pages) {
    if (USE_MYSQL) {
      const existing = await mysqlStore.getContentPageBySlug(page.slug);
      if (!existing) {
        await mysqlStore.upsertContentPage(page);
        seeded = true;
      }
      continue;
    }

    const db = await jsonStore.readDb();
    if (!db.contentPages.some((item) => item.slug === page.slug)) {
      await jsonStore.updateDb((draft) => {
        draft.contentPages.push({ ...page } as ContentPage);
      });
      seeded = true;
    }
  }

  if (seeded) {
    console.log("[meme-server] Missing content pages seeded:", REQUIRED_CONTENT_SLUGS.join(", "));
  }
  return seeded;
}

/** 已有业务数据但后台账号表为空时补种默认账号 */
export async function ensureAdminUsersSeeded() {
  const { buildDefaultAdminUsers } = await import("../services/admin-users.js");

  if (USE_MYSQL) {
    if (!(await mysqlStore.isAdminUsersEmpty())) return false;
    await mysqlStore.seedAdminUsersMissing(await buildDefaultAdminUsers());
    console.log("[meme-server] Admin users seeded");
    return true;
  }

  const db = await jsonStore.readDb();
  if (db.adminUsers.length > 0) return false;
  const users = await buildDefaultAdminUsers();
  await jsonStore.updateDb((draft) => {
    draft.adminUsers = users.map((user) => ({ ...user }));
  });
  console.log("[meme-server] Admin users seeded (JSON store)");
  return true;
}

/** 已有业务数据但标签表为空时补种默认标签 */
export async function ensureProductTagsSeeded() {
  const data = await loadSeedDatabase();
  const tags = data.productTags?.length ? data.productTags : DEFAULT_PRODUCT_TAGS;

  if (USE_MYSQL) {
    if (!(await mysqlStore.isProductTagsEmpty())) return false;
    await mysqlStore.seedProductTagsMissing(tags);
    console.log("[meme-server] Product tags seeded");
    return true;
  }

  const db = await jsonStore.readDb();
  if (db.productTags.length > 0) return false;
  await jsonStore.updateDb((draft) => {
    draft.productTags = tags.map((tag) => ({ ...tag }));
  });
  console.log("[meme-server] Product tags seeded (JSON store)");
  return true;
}

/** 启动时按累计消费校正 VIP 等级（修复历史 seed / 手动改等级 / 漏记充值） */
export async function ensureUsersVipSynced() {
  const { syncAllUsersVipFromConsume } = await import("../services/vip-member.js");
  const result = await syncAllUsersVipFromConsume();
  if (result.consumeFixed > 0 || result.vipFixed > 0) {
    console.log(
      `[meme-server] User membership reconciled (${result.consumeFixed} consume, ${result.vipFixed} vip, ${result.total} users checked)`,
    );
  }
  return result.consumeFixed > 0 || result.vipFixed > 0;
}

/** 已有用户但无优惠券时，按 CMS 模板补发默认可用券 */
export async function ensureUserCouponsSeeded() {
  const { grantDefaultCouponsForUser } = await import("../services/coupons.js");

  if (USE_MYSQL) {
    const mysqlStore = await import("./mysql-store.js");
    if (!(await mysqlStore.isUserCouponsEmpty())) return false;
    const users = await mysqlStore.listUsers();
    let granted = 0;
    for (const user of users) {
      const created = await grantDefaultCouponsForUser(user.id);
      granted += created.length;
    }
    if (granted > 0) {
      console.log(`[meme-server] User coupons seeded (${granted} coupons)`);
    }
    return granted > 0;
  }

  const db = await jsonStore.readDb();
  if ((db.userCoupons?.length ?? 0) > 0) return false;
  let granted = 0;
  for (const user of db.users) {
    const created = await grantDefaultCouponsForUser(user.id);
    granted += created.length;
  }
  if (granted > 0) {
    console.log(`[meme-server] User coupons seeded (${granted} coupons, JSON store)`);
  }
  return granted > 0;
}

/** 补全用户邀请码（历史用户迁移） */
export async function ensureUserInviteCodesSeeded() {
  const { ensureAllUsersInviteCodes } = await import("../services/invite-user.js");
  const fixed = await ensureAllUsersInviteCodes();
  if (fixed > 0) {
    console.log(`[meme-server] User invite codes backfilled (${fixed} users)`);
  }
  return fixed > 0;
}
