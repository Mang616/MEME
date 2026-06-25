import { platformDomains, prodApiBase } from "./lib/platform-domains.js";

export const PORT = Number(process.env.PORT ?? platformDomains.development.apiPort);

export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const IS_PRODUCTION = NODE_ENV === "production";

export const DATABASE_URL = process.env.DATABASE_URL?.trim() ?? "";
export const USE_MYSQL = Boolean(DATABASE_URL);

export const PUBLIC_SITE_URL =
  process.env.PUBLIC_SITE_URL?.trim() || platformDomains.production.site;
export const PUBLIC_API_URL =
  process.env.PUBLIC_API_URL?.trim() || platformDomains.production.api;
export const PUBLIC_ADMIN_URL =
  process.env.PUBLIC_ADMIN_URL?.trim() || platformDomains.production.admin;

const defaultCorsOrigins = [
  platformDomains.production.site,
  platformDomains.production.admin,
  `http://localhost:${platformDomains.development.websitePort}`,
  `http://localhost:${platformDomains.development.adminPort}`,
  `http://127.0.0.1:${platformDomains.development.adminPort}`,
];

export const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  : defaultCorsOrigins;

export { platformDomains, prodApiBase };

export const ADMIN_ACCOUNT = {
  username: process.env.ADMIN_USERNAME ?? "admin",
  password: process.env.ADMIN_PASSWORD ?? "admin123",
};

export const AUTH_SECRET = process.env.AUTH_SECRET ?? "meme-dev-secret-change-me";

/** 腾讯云 COS（密钥仅放 .env，勿提交仓库） */
export const COS_CONFIG = {
  secretId: process.env.COS_SECRET_ID?.trim() ?? "",
  secretKey: process.env.COS_SECRET_KEY?.trim() ?? "",
  bucket: process.env.COS_BUCKET?.trim() ?? "",
  region: process.env.COS_REGION?.trim() ?? "ap-guangzhou",
  appId: process.env.COS_APP_ID?.trim() ?? "1322855353",
  publicBase: process.env.COS_PUBLIC_BASE?.trim() ?? "",
  /** 私有桶（默认 true）：对外通过签名 URL 访问 */
  private: process.env.COS_PRIVATE?.trim() !== "false",
  signExpiresSec: Number(process.env.COS_SIGN_EXPIRES_SEC ?? 7200),
};

export function isCosEnabled() {
  return Boolean(
    COS_CONFIG.secretId &&
      COS_CONFIG.secretKey &&
      COS_CONFIG.bucket &&
      COS_CONFIG.region,
  );
}

if (IS_PRODUCTION) {
  const weakSecret = AUTH_SECRET === "meme-dev-secret-change-me";
  const weakPassword = ADMIN_ACCOUNT.password === "admin123";
  if (!USE_MYSQL) {
    console.warn("[meme-server] 生产环境请设置 DATABASE_URL 使用 MySQL");
  }
  if (weakSecret || weakPassword) {
    console.warn(
      "[meme-server] 生产环境请设置 AUTH_SECRET、ADMIN_PASSWORD（见 apps/server/.env.example）",
    );
  }
  if (!isCosEnabled()) {
    console.warn("[meme-server] 生产环境建议配置 COS 图片存储（见 apps/server/.env.example）");
  }
}
