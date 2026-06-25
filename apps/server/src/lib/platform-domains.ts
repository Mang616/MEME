import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type PlatformDomains = {
  rootDomain: string;
  brand: { name: string; nameDoc: string };
  production: {
    site: string;
    api: string;
    admin: string;
    order: string;
  };
  development: {
    apiHost: string;
    apiPort: number;
    adminPort: number;
    websitePort: number;
    lanHost: string;
  };
  miniprogram: { env: string };
  wechat: {
    requestLegalDomain: string;
    uploadFileDomain: string;
    downloadFileDomain: string;
    businessDomain: string;
  };
};

const domainsPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../config/domains.json",
);

export const platformDomains = JSON.parse(
  readFileSync(domainsPath, "utf8"),
) as PlatformDomains;

export const prodApiBase = `${platformDomains.production.api.replace(/\/$/, "")}/api`;
