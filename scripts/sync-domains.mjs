/**
 * 从 config/domains.json 同步到各端可读的文件
 * 运行: npm run config:sync
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const domainsPath = path.join(root, "config/domains.json");
const domains = JSON.parse(readFileSync(domainsPath, "utf8"));

const prodApiBase = `${domains.production.api.replace(/\/$/, "")}/api`;

const miniprogramOut = `/**
 * 平台域名（自动生成，请勿手改）
 * 修改 config/domains.json 后执行: npm run config:sync
 */
module.exports = ${JSON.stringify(
  {
    rootDomain: domains.rootDomain,
    brand: domains.brand,
    production: domains.production,
    development: domains.development,
    miniprogram: domains.miniprogram,
    wechat: domains.wechat,
    prodApiBase,
  },
  null,
  2,
)}
`;

writeFileSync(
  path.join(root, "apps/miniprogram/utils/platform-domains.js"),
  miniprogramOut + "\n",
  "utf8",
);

console.log("[config:sync] apps/miniprogram/utils/platform-domains.js");
