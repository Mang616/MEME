import {
  createAnnouncement,
  createBanner,
  getAnnouncement,
  getBanner,
  getContentPageBySlug,
  getUser,
  listAnnouncements,
  listBanners,
  listContentPages,
  listOrders,
  listUserLedgerByUser,
  listUsers,
  removeAnnouncement,
  removeBanner,
  updateAnnouncement,
  updateBanner,
  updateUser,
  upsertContentPage,
} from "../db/index.js";
import { createEntity } from "../lib/create-entity.js";
import { formatDateTime } from "../lib/format-time.js";
import type { ImageUploadFolder } from "../lib/image-process.js";
import {
  cleanupReplacedMedia,
  deleteMediaStorage,
  finalizeEntityMedia,
} from "../lib/media-lifecycle.js";
import type { Announcement, AppUser, Banner, ContentPage } from "../types.js";
import { toAdminOrderRow } from "../lib/mappers.js";
import { syncUserVipFromConsume } from "./vip-member.js";
import { mapAdminUserRows, resolveInviterSummary, toAdminUserRow } from "./invite-user.js";

function isAnnouncementActive(item: Announcement, at = formatDateTime()) {
  if (!item.enabled) return false;
  if (item.startAt && item.startAt > at) return false;
  if (item.endAt && item.endAt < at) return false;
  return true;
}

async function syncImageOnCreate(
  folder: ImageUploadFolder,
  entityId: string,
  image: string,
) {
  const finalized = await finalizeEntityMedia(image, folder, entityId);
  return finalized ?? image;
}

async function syncImageOnUpdate(
  folder: ImageUploadFolder,
  entityId: string,
  previous: string | undefined,
  next: string,
) {
  const image = (await finalizeEntityMedia(next, folder, entityId)) ?? next;
  await cleanupReplacedMedia(previous, image);
  return image;
}

async function finalizeAdminUser(id: string) {
  const synced = await syncUserVipFromConsume(id);
  return synced ? toAdminUserRow(synced) : null;
}

function normalizeInviterPatch(
  id: string,
  patch: Partial<Pick<AppUser, "nickname" | "phone" | "avatar" | "status" | "inviterId">>,
) {
  if (patch.inviterId === undefined) return patch;

  const normalizedInviterId = String(patch.inviterId || "").trim();
  if (normalizedInviterId && normalizedInviterId === id) {
    throw new Error("上级不能是自己");
  }
  return { ...patch, inviterId: normalizedInviterId };
}

async function assertInviterExists(inviterId: string) {
  if (!inviterId) return;
  const inviter = await getUser(inviterId);
  if (!inviter) throw new Error("上级用户不存在");
}

export const userService = {
  async list() {
    const users = await listUsers();
    return mapAdminUserRows(users);
  },

  async getById(id: string) {
    const user = await getUser(id);
    if (!user) return null;
    return toAdminUserRow(user);
  },

  async getDetail(id: string) {
    const user = await syncUserVipFromConsume(id);
    if (!user) return null;

    const [ledger, orders, inviter] = await Promise.all([
      listUserLedgerByUser(id),
      listOrders(),
      user.inviterId ? resolveInviterSummary(user.inviterId) : Promise.resolve(null),
    ]);

    const userOrders = orders
      .filter((order) => order.ownerUserId === id)
      .sort((a, b) => b.orderTime.localeCompare(a.orderTime))
      .map(toAdminOrderRow);

    const adminUser = await toAdminUserRow(user);

    return { user: adminUser, ledger, orders: userOrders, inviter };
  },

  async update(
    id: string,
    patch: Partial<Pick<AppUser, "nickname" | "phone" | "avatar" | "status" | "inviterId">>,
  ) {
    const existing = await getUser(id);
    if (!existing) return null;

    const normalizedPatch = normalizeInviterPatch(id, patch);
    if (
      normalizedPatch.inviterId !== undefined &&
      existing.inviterId &&
      normalizedPatch.inviterId !== existing.inviterId
    ) {
      throw new Error("用户已有上级，不可重复绑定");
    }
    if (normalizedPatch.inviterId !== undefined) {
      await assertInviterExists(normalizedPatch.inviterId);
    }

    let nextPatch = { ...normalizedPatch };
    if (normalizedPatch.avatar !== undefined) {
      const avatar = normalizedPatch.avatar
        ? await syncImageOnUpdate("avatars", id, existing.avatar, normalizedPatch.avatar)
        : "";
      await cleanupReplacedMedia(existing.avatar, avatar || undefined);
      nextPatch = { ...normalizedPatch, avatar };
    }

    const updated = await updateUser(id, nextPatch);
    return updated ? finalizeAdminUser(id) : null;
  },
};

export const bannerService = {
  async listPublished() {
    const items = await listBanners();
    return items.filter((banner) => banner.published !== false);
  },

  async list() {
    return listBanners();
  },

  async getById(id: string) {
    return getBanner(id);
  },

  async create(input: Omit<Banner, "id"> & { id?: string }) {
    const entity = await createEntity({
      idPrefix: "b",
      existsError: "BANNER_EXISTS",
      getById: getBanner,
      create: createBanner,
      input,
    });

    if (!input.image) return entity;

    const image = await syncImageOnCreate("banners", entity.id, input.image);
    if (image === input.image) return entity;

    return (await updateBanner(entity.id, { image })) ?? { ...entity, image };
  },

  async update(id: string, patch: Partial<Banner>) {
    if (patch.image === undefined) {
      return updateBanner(id, patch);
    }

    const existing = await getBanner(id);
    if (!existing) return null;

    const image = patch.image
      ? await syncImageOnUpdate("banners", id, existing.image, patch.image)
      : "";
    await cleanupReplacedMedia(existing.image, image || undefined);
    return updateBanner(id, { ...patch, image });
  },

  async remove(id: string) {
    const existing = await getBanner(id);
    const ok = await removeBanner(id);
    if (ok) await deleteMediaStorage(existing?.image);
    return ok;
  },
};

export const announcementService = {
  async listActive(placement?: Announcement["placement"]) {
    const items = await listAnnouncements();
    return items.filter(
      (item) => isAnnouncementActive(item) && (!placement || item.placement === placement),
    );
  },

  async list() {
    return listAnnouncements();
  },

  async getById(id: string) {
    return getAnnouncement(id);
  },

  async create(input: Omit<Announcement, "id"> & { id?: string }) {
    return createEntity({
      idPrefix: "a",
      existsError: "ANNOUNCEMENT_EXISTS",
      getById: getAnnouncement,
      create: createAnnouncement,
      input,
    });
  },

  async update(id: string, patch: Partial<Announcement>) {
    return updateAnnouncement(id, patch);
  },

  async remove(id: string) {
    return removeAnnouncement(id);
  },
};

/** 商品封面归档（供 productService 使用） */
export async function syncProductCoverOnCreate(productId: string, cover: string) {
  return syncImageOnCreate("products", productId, cover);
}

export async function syncProductCoverOnUpdate(
  productId: string,
  previous: string | undefined,
  next: string,
) {
  return syncImageOnUpdate("products", productId, previous, next);
}

export async function deleteProductCover(cover: string | undefined) {
  await deleteMediaStorage(cover);
}

export const contentPageService = {
  async list() {
    return listContentPages();
  },

  async getBySlug(slug: string) {
    return getContentPageBySlug(slug);
  },

  async updateBySlug(
    slug: string,
    patch: Partial<Pick<ContentPage, "title" | "payload">>,
  ) {
    const existing = await getContentPageBySlug(slug);
    if (!existing) return null;

    let payload = patch.payload ?? existing.payload;
    if (slug === "vip-config" && payload && typeof payload === "object") {
      payload = await syncVipConfigIcons(
        existing.payload as Record<string, unknown>,
        payload as Record<string, unknown>,
      );
    }

    const page: ContentPage = {
      ...existing,
      title: patch.title ?? existing.title,
      payload,
    };
    return upsertContentPage(page);
  },
};

type VipLevelConfigItem = {
  level: number;
  icon?: string;
};

async function syncVipConfigIcons(
  existingPayload: Record<string, unknown>,
  nextPayload: Record<string, unknown>,
) {
  const folder: ImageUploadFolder = "vip-levels";
  const prevList = Array.isArray(existingPayload.levelList)
    ? (existingPayload.levelList as VipLevelConfigItem[])
    : [];
  const nextList = Array.isArray(nextPayload.levelList)
    ? (nextPayload.levelList as VipLevelConfigItem[])
    : [];

  const levelList = await Promise.all(
    nextList.map(async (item) => {
      if (!item || typeof item !== "object") return item;
      const level = Number(item.level);
      if (!Number.isFinite(level)) return item;

      const prev = prevList.find((row) => row.level === level);
      let icon = typeof item.icon === "string" ? item.icon : "";
      if (icon) {
        const finalized = await finalizeEntityMedia(icon, folder, `level-${level}`);
        icon = finalized ?? icon;
        if (prev?.icon && prev.icon !== icon) {
          await cleanupReplacedMedia(prev.icon, icon);
        }
      } else if (prev?.icon) {
        await cleanupReplacedMedia(prev.icon, undefined);
      }

      return { ...item, icon };
    }),
  );

  return { ...nextPayload, levelList };
}
