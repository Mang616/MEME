#!/usr/bin/env node
/**
 * 将 packages/invite-activity-defaults 编译为 CJS 供小程序 / seed 脚本使用
 * 运行: npm run miniprogram:sync-invite-activity
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const src = path.join(root, "packages/invite-activity-defaults/index.js");
const dest = path.join(root, "apps/miniprogram/utils/invite-activity-defaults.js");

const banner = `/**
 * 与 packages/invite-activity-defaults/index.js 同步，运行 npm run miniprogram:sync-invite-activity 更新。
 */
`;

const { outputFiles } = esbuild.buildSync({
  entryPoints: [src],
  bundle: true,
  format: "cjs",
  platform: "neutral",
  write: false,
});

fs.writeFileSync(dest, banner + outputFiles[0].text, "utf8");
console.log("Synced", path.relative(root, dest));
