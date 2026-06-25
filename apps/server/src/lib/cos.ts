import COS from "cos-nodejs-sdk-v5";
import { COS_CONFIG, isCosEnabled } from "../config.js";
import type { ImageUploadFolder } from "./image-process.js";
import { buildMediaObjectKey } from "./media-storage.js";
import { toCosStorage } from "./media-url.js";

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const ALLOWED_FOLDERS = new Set<ImageUploadFolder>([
  "banners",
  "products",
  "avatars",
  "vip-levels",
  "common",
]);

let client: COS | null = null;

function getClient() {
  if (!isCosEnabled()) {
    throw new Error("图片存储未配置");
  }
  if (!client) {
    client = new COS({
      SecretId: COS_CONFIG.secretId,
      SecretKey: COS_CONFIG.secretKey,
    });
  }
  return client;
}

export function isCosStorage(value: string) {
  return (
    value.startsWith("cos:") ||
    value.startsWith("images/") ||
    value.startsWith("meme/")
  );
}

export function getCosOrigin() {
  if (COS_CONFIG.publicBase) {
    return COS_CONFIG.publicBase.replace(/\/$/, "");
  }
  return `https://${COS_CONFIG.bucket}.cos.${COS_CONFIG.region}.myqcloud.com`;
}

function sanitizeFolder(folder: string): ImageUploadFolder {
  const name = folder.trim().toLowerCase();
  if (!ALLOWED_FOLDERS.has(name as ImageUploadFolder)) {
    throw new Error(`不支持的图片类型：${folder}`);
  }
  return name as ImageUploadFolder;
}

export type UploadImageInput = {
  folder: string;
  buffer: Buffer;
  mime: string;
  originalName: string;
  entityId?: string;
};

export function getPublicObjectUrl(key: string) {
  const encodedKey = key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${getCosOrigin()}/${encodedKey}`;
}

export function getObjectUrl(key: string, expiresSec = COS_CONFIG.signExpiresSec) {
  if (COS_CONFIG.private) {
    return getSignedObjectUrl(key, expiresSec);
  }
  return Promise.resolve(getPublicObjectUrl(key));
}

export function getSignedObjectUrl(key: string, expiresSec = COS_CONFIG.signExpiresSec) {
  const cos = getClient();
  return new Promise<string>((resolve, reject) => {
    cos.getObjectUrl(
      {
        Bucket: COS_CONFIG.bucket,
        Region: COS_CONFIG.region,
        Key: key,
        Sign: true,
        Expires: expiresSec,
      },
      (err, data) => {
        if (err) reject(err);
        else resolve(data.Url);
      },
    );
  });
}

export function deleteCosObject(key: string) {
  const cos = getClient();
  return new Promise<void>((resolve, reject) => {
    cos.deleteObject(
      {
        Bucket: COS_CONFIG.bucket,
        Region: COS_CONFIG.region,
        Key: key,
      },
      (err) => {
        if (err) reject(err);
        else resolve();
      },
    );
  });
}

export function copyCosObject(sourceKey: string, targetKey: string) {
  const cos = getClient();
  return new Promise<void>((resolve, reject) => {
    cos.putObjectCopy(
      {
        Bucket: COS_CONFIG.bucket,
        Region: COS_CONFIG.region,
        Key: targetKey,
        CopySource: `${COS_CONFIG.bucket}.cos.${COS_CONFIG.region}.myqcloud.com/${sourceKey}`,
      },
      (err) => {
        if (err) reject(err);
        else resolve();
      },
    );
  });
}

export async function uploadImageToCos(input: UploadImageInput) {
  const folder = sanitizeFolder(input.folder);
  if (!MIME_EXT[input.mime]) {
    throw new Error("仅支持 jpg / png / webp / gif 图片");
  }

  const key = buildMediaObjectKey(folder, input.mime, input.entityId);
  const cos = getClient();

  await new Promise<void>((resolve, reject) => {
    cos.putObject(
      {
        Bucket: COS_CONFIG.bucket,
        Region: COS_CONFIG.region,
        Key: key,
        Body: input.buffer,
        ContentType: input.mime,
      },
      (err) => {
        if (err) reject(err);
        else resolve();
      },
    );
  });

  const storage = toCosStorage(key);
  const url = await getObjectUrl(key);

  return {
    key,
    storage,
    url,
  };
}

export function getCosStatus() {
  return {
    enabled: isCosEnabled(),
    private: COS_CONFIG.private,
    signExpiresSec: COS_CONFIG.signExpiresSec,
    origin: isCosEnabled() ? getCosOrigin() : "",
    bucket: COS_CONFIG.bucket,
    region: COS_CONFIG.region,
    folders: [...ALLOWED_FOLDERS],
    layout: "meme/{类型}/{业务ID}/cover|avatar.webp",
  };
}
