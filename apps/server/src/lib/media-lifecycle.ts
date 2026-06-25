import { isCosEnabled } from "../config.js";
import { copyCosObject, deleteCosObject } from "./cos.js";
import type { ImageUploadFolder } from "./image-process.js";
import { extractCosKey, toCosStorage } from "./media-url.js";
import {
  buildEntityMediaKey,
  isManagedMediaKey,
  isPendingMediaKey,
  mediaKeyExt,
} from "./media-storage.js";

function mimeFromExt(ext: string) {
  if (ext === "gif") return "image/gif";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return "image/webp";
}

/** 新建保存后：把 _pending 临时图归档到业务目录 */
export async function finalizeEntityMedia(
  storage: string | undefined,
  folder: ImageUploadFolder,
  entityId: string,
): Promise<string | undefined> {
  if (!storage || !isCosEnabled()) return storage;

  const key = extractCosKey(storage);
  if (!key || !isPendingMediaKey(key)) return storage;

  const ext = mediaKeyExt(key);
  const targetKey = buildEntityMediaKey(folder, entityId, mimeFromExt(ext), true);

  if (targetKey === key) return storage;

  await copyCosObject(key, targetKey);
  await deleteCosObject(key);
  return toCosStorage(targetKey);
}

/** 换图或清空时删除不再引用的旧文件 */
export async function cleanupReplacedMedia(
  oldStorage: string | undefined,
  newStorage: string | undefined,
) {
  if (!oldStorage || oldStorage === newStorage || !isCosEnabled()) return;

  const oldKey = extractCosKey(oldStorage);
  const newKey = newStorage ? extractCosKey(newStorage) : null;
  if (!oldKey || !isManagedMediaKey(oldKey)) return;
  if (newKey && oldKey === newKey) return;

  try {
    await deleteCosObject(oldKey);
  } catch {
    // 清理失败不阻断业务保存
  }
}

/** 删除业务实体时移除关联图片 */
export async function deleteMediaStorage(storage: string | undefined) {
  if (!storage || !isCosEnabled()) return;

  const key = extractCosKey(storage);
  if (!key || !isManagedMediaKey(key)) return;

  try {
    await deleteCosObject(key);
  } catch {
    // 同上
  }
}
