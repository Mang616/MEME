#!/usr/bin/env node
/**
 * 校验 app.json 登记的每个页面是否具备 index.wxml / index.js
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MINIPROGRAM_ROOT = path.join(ROOT, "apps", "miniprogram");

/** 关键静态图：缺失会导致页面大面积空白 */
const REQUIRED_ASSETS = [
  "assets/brand/logo.png",
  "assets/brand/logo.webp",
  "assets/home/huhang.webp",
  "assets/home/peiwan.webp",
  "assets/tab/home-dark.png",
  "assets/profile/boys.webp",
  "assets/level/0.webp",
];

const app = JSON.parse(fs.readFileSync(path.join(MINIPROGRAM_ROOT, "app.json"), "utf8"));
const pages = app.pages || [];

let failed = 0;
for (const pagePath of pages) {
  const wxml = path.join(MINIPROGRAM_ROOT, `${pagePath}.wxml`);
  const js = path.join(MINIPROGRAM_ROOT, `${pagePath}.js`);
  if (!fs.existsSync(wxml)) {
    console.error("MISSING WXML:", pagePath);
    failed += 1;
  }
  if (!fs.existsSync(js)) {
    console.error("MISSING JS:", pagePath);
    failed += 1;
  }
}

for (const rel of REQUIRED_ASSETS) {
  const abs = path.join(MINIPROGRAM_ROOT, rel);
  if (!fs.existsSync(abs)) {
    console.error("MISSING ASSET:", rel);
    failed += 1;
  }
}

if (failed === 0) {
  console.log(`OK: ${pages.length} pages verified at ${MINIPROGRAM_ROOT}`);
  process.exit(0);
}

console.error(`\n${failed} issue(s). Fix app.json or add page files.`);
process.exit(1);
