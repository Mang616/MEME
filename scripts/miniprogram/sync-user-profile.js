#!/usr/bin/env node
/**
 * 将 packages/user-profile 同步到小程序 utils（微信无法 require 项目外路径）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE = path.join(ROOT, "packages", "user-profile", "index.js");
const TARGET = path.join(ROOT, "apps", "miniprogram", "utils", "user-profile.js");

const HEADER = `/**
 * 与 packages/user-profile/index.js 同步，运行 npm run miniprogram:sync-profile 更新。
 * 小程序无法 require 项目根 packages，故保留此副本。
 */
`;

const sourceBody = fs.readFileSync(SOURCE, "utf8").replace(/^["']use strict["'];\n\n?/, "");
fs.writeFileSync(TARGET, HEADER + sourceBody);
console.log("Synced user-profile -> apps/miniprogram/utils/user-profile.js");
