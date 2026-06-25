import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getContentPageBySlug, upsertContentPage } from "../db/index.js";
import { isCosEnabled } from "../config.js";
import { uploadImageToCos } from "../lib/cos.js";
import { processUploadImage } from "../lib/image-process.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../../..");
const ASSET_DIRS = [
  path.join(REPO_ROOT, "apps/admin/src/assets/vip-level"),
  path.join(REPO_ROOT, "apps/miniprogram/assets/level"),
];

type VipLevelItem = {
  level: number;
  label: string;
  title: string;
  icon: string;
  bg: string;
  color: string;
};

type VipConfigPayload = {
  vipMin: number;
  vipMax: number;
  levelList: VipLevelItem[];
};

async function findLevelAsset(level: number) {
  for (const dir of ASSET_DIRS) {
    for (const ext of ["webp", "png"]) {
      const filePath = path.join(dir, `${level}.${ext}`);
      try {
        await fs.access(filePath);
        return { filePath, mime: ext === "png" ? "image/png" : "image/webp" };
      } catch {
        /* try next */
      }
    }
  }
  return null;
}

async function uploadLevelIcon(level: number) {
  const asset = await findLevelAsset(level);
  if (!asset) {
    throw new Error(`找不到 VIP${level} 图标文件`);
  }

  const buffer = await fs.readFile(asset.filePath);
  const processed = await processUploadImage({
    folder: "vip-levels",
    buffer,
    mime: asset.mime,
  });

  const result = await uploadImageToCos({
    folder: "vip-levels",
    buffer: processed.buffer,
    mime: processed.mime,
    originalName: `${level}.webp`,
    entityId: `level-${level}`,
  });

  return result.storage;
}

async function main() {
  if (!isCosEnabled()) {
    console.error("[upload-vip-icons] COS 未配置，请检查 apps/server/.env");
    process.exit(1);
  }

  const page = await getContentPageBySlug("vip-config");
  if (!page) {
    console.error("[upload-vip-icons] 数据库中不存在 vip-config 内容页");
    process.exit(1);
  }

  const payload = page.payload as VipConfigPayload;
  const vipMin = payload.vipMin ?? 0;
  const vipMax = payload.vipMax ?? 10;
  const byLevel = new Map((payload.levelList ?? []).map((item) => [item.level, { ...item }]));

  console.log(`[upload-vip-icons] 上传 VIP${vipMin}–VIP${vipMax} 图标到 COS…`);

  for (let level = vipMin; level <= vipMax; level += 1) {
    const storage = await uploadLevelIcon(level);
    const current = byLevel.get(level) ?? {
      level,
      label: `VIP${level}`,
      title: `等级${level}`,
      icon: "",
      bg: "rgba(120, 120, 128, 0.22)",
      color: "#B8B8C0",
    };
    byLevel.set(level, { ...current, icon: storage });
    console.log(`  VIP${level} -> ${storage}`);
  }

  const nextPayload: VipConfigPayload = {
    vipMin,
    vipMax,
    levelList: Array.from(byLevel.values()).sort((a, b) => a.level - b.level),
  };

  await upsertContentPage({
    ...page,
    payload: nextPayload,
  });

  console.log("[upload-vip-icons] 已更新 vip-config 内容页");
}

main().catch((err) => {
  console.error("[upload-vip-icons] failed:", err);
  process.exit(1);
});
