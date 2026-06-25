import { randomBytes } from "node:crypto";
import path from "node:path";
import type { ImageUploadFolder } from "./image-process.js";

/** 桶内根目录，与本项目其他业务隔离 */
export const MEDIA_ROOT = "meme";

const SLOT_BY_FOLDER: Record<ImageUploadFolder, string> = {
  banners: "cover",
  products: "cover",
  avatars: "avatar",
  "vip-levels": "icon",
  common: "image",
};

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function sanitizeEntityId(entityId: string) {
  return entityId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
}

function extFromMime(mime: string) {
  return MIME_EXT[mime] ?? "webp";
}

export function buildEntityMediaKey(
  folder: ImageUploadFolder,
  entityId: string,
  mime: string,
  versioned = false,
) {
  const safeId = sanitizeEntityId(entityId);
  if (!safeId) {
    throw new Error("无效的业务 ID");
  }
  const slot = SLOT_BY_FOLDER[folder];
  const ext = extFromMime(mime);
  const name = versioned ? `${slot}-${Date.now().toString(36)}` : slot;
  return `${MEDIA_ROOT}/${folder}/${safeId}/${name}.${ext}`;
}

/** 有业务 ID 时固定路径（覆盖更新）；新建尚未保存时进 _pending */
export function buildMediaObjectKey(
  folder: ImageUploadFolder,
  mime: string,
  entityId?: string,
) {
  if (entityId) {
    const safeId = sanitizeEntityId(entityId);
    if (safeId) {
      return buildEntityMediaKey(folder, safeId, mime, true);
    }
  }

  const ext = extFromMime(mime);
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const pendingId = randomBytes(8).toString("hex");
  return `${MEDIA_ROOT}/${folder}/_pending/${year}/${month}/${pendingId}.${ext}`;
}

export function isPendingMediaKey(key: string) {
  return /\/_pending\//.test(key);
}

export function isManagedMediaKey(key: string) {
  return key.startsWith(`${MEDIA_ROOT}/`) || key.startsWith("images/");
}

export function mediaKeyExt(key: string) {
  return path.extname(key).replace(/^\./, "").toLowerCase() || "webp";
}
