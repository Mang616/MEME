import { COS_CONFIG, isCosEnabled } from "../config.js";
import { getObjectUrl, isCosStorage } from "./cos.js";

/** 写入数据库的 COS 引用前缀 */
export const COS_STORAGE_PREFIX = "cos:";

export function toCosStorage(key: string) {
  return `${COS_STORAGE_PREFIX}${key}`;
}

export function extractCosKey(value: string) {
  if (!value) return null;
  if (value.startsWith(COS_STORAGE_PREFIX)) {
    return value.slice(COS_STORAGE_PREFIX.length);
  }
  if (value.startsWith("images/")) {
    return value;
  }
  if (value.startsWith("meme/")) {
    return value;
  }
  return null;
}

/** 对外返回可访问 URL（私有桶签名，公有读桶直链） */
export async function resolveMediaUrl(
  value: string | undefined | null,
  expiresSec = COS_CONFIG.signExpiresSec,
) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const cosKey = extractCosKey(raw);
  if (cosKey && isCosEnabled()) {
    return getObjectUrl(cosKey, expiresSec);
  }

  return raw;
}

export function isResolvableCosValue(value: string | undefined | null) {
  return isCosStorage(String(value ?? ""));
}

/** 为展示 URL 追加版本参数，绕过客户端对同路径图片的强缓存 */
export function appendMediaVersion(url: string, rev?: number) {
  const raw = String(url ?? "").trim();
  if (!raw || !rev || rev <= 0) return raw;
  if (/[?&]v=\d+/.test(raw)) return raw;
  const sep = raw.includes("?") ? "&" : "?";
  return `${raw}${sep}v=${rev}`;
}
