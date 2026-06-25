import { spawnSync } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const WEBSITE_REQUIRED_FILES = [
  "apps/website/app/layout.tsx",
  "apps/website/app/page.tsx",
  "apps/website/app/order/page.tsx",
  "apps/website/app/globals.css",
  "apps/website/app/meme.css",
  "apps/website/app/robots.ts",
  "apps/website/app/sitemap.ts",
  "apps/website/next.config.ts",
  "apps/website/lib/content.ts",
  "apps/website/lib/site.ts",
  "apps/website/lib/theme.ts",
  "apps/website/components/entry-link.tsx",
  "apps/website/public/assets/meme-logo-96.png",
  "apps/website/public/assets/home-huhang-320.png",
  "apps/website/public/assets/home-peiwan-320.png",
  "apps/website/public/assets/theme-dark.png",
  "apps/website/public/assets/theme-light.png",
  "apps/website/public/assets/pepe-thinking.png",
  "apps/website/public/assets/pepe-hero.png",
  "apps/website/public/favicon.png",
  "apps/website/public/apple-touch-icon.png",
  "packages/theme/tokens.css",
  "packages/types/src/index.ts",
];

const ADMIN_REQUIRED_FILES = [
  "apps/admin/package.json",
  "apps/admin/vite.config.ts",
  "apps/admin/index.html",
  "apps/admin/src/main.tsx",
  "apps/admin/src/router/index.tsx",
  "apps/admin/src/layouts/AdminLayout.tsx",
  "apps/admin/src/lib/api.ts",
  "apps/admin/src/constants/labels.ts",
  "apps/admin/src/pages/login/index.tsx",
  "apps/admin/src/pages/orders/index.tsx",
  "apps/admin/src/pages/products/index.tsx",
  "apps/admin/src/pages/handlers/index.tsx",
  "apps/admin/public/favicon.png",
  "apps/admin/public/apple-touch-icon.png",
  "apps/admin/public/site.webmanifest",
];

const SERVER_REQUIRED_FILES = [
  "apps/server/package.json",
  "apps/server/seed/initial.json",
  "apps/server/README.md",
  "apps/server/src/index.ts",
  "apps/server/src/services.ts",
  "apps/server/src/db/index.ts",
  "apps/server/src/routes/admin/orders.ts",
  "apps/server/src/routes/admin/products.ts",
  "apps/server/src/routes/admin/handlers.ts",
  "apps/server/src/routes/public.ts",
];

const MINIPROGRAM_DOC_FILES = [
  "apps/miniprogram/docs/ARCHITECTURE.md",
  "apps/miniprogram/docs/DEVTOOLS.md",
];

const DEPRECATED_STATIC_FILES = [
  "apps/website/index.html",
  "apps/website/styles.css",
  "apps/website/site.js",
  "apps/website/delta-force/index.html",
  "apps/website/app/delta-force/page.tsx",
  "apps/website/components/match-quiz.tsx",
];

const FORBIDDEN_COPY_PATTERNS = [
  /\bSEO\b/i,
  /\bPWA\b/i,
  /后台/,
  /技术实现/,
  /落地页/,
  /Web版小程序/,
  /meme-esports-hero\.png/,
  /三角洲/,
  /护航/,
  /老板/,
];

function fromRoot(file) {
  return path.join(ROOT, file);
}

async function assertFileExists(file) {
  await stat(fromRoot(file));
}

async function assertFileMissing(file) {
  try {
    await stat(fromRoot(file));
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") return;
    throw err;
  }
  throw new Error(`Deprecated static file still present: ${file}`);
}

async function collectFiles(dir, extension) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(full, extension)));
    } else if (entry.name.endsWith(extension)) {
      files.push(full);
    }
  }

  return files;
}

async function assertNoForbiddenCopy(files) {
  for (const file of files) {
    const content = await readFile(file, "utf8");
    for (const pattern of FORBIDDEN_COPY_PATTERNS) {
      if (pattern.test(content)) {
        throw new Error(`Forbidden copy pattern ${pattern} in ${path.relative(ROOT, file)}`);
      }
    }
  }
}

async function assertWebsite() {
  for (const file of WEBSITE_REQUIRED_FILES) {
    await assertFileExists(file);
  }

  for (const file of DEPRECATED_STATIC_FILES) {
    await assertFileMissing(file);
  }

  const copyScanFiles = [
    ...(await collectFiles(fromRoot("apps/website/app"), ".tsx")),
    ...(await collectFiles(fromRoot("apps/website/components"), ".tsx")),
    fromRoot("apps/website/lib/content.ts"),
  ];

  await assertNoForbiddenCopy(copyScanFiles);

  const layout = await readFile(fromRoot("apps/website/app/layout.tsx"), "utf8");
  const home = await readFile(fromRoot("apps/website/app/page.tsx"), "utf8");
  const nextConfig = await readFile(fromRoot("apps/website/next.config.ts"), "utf8");

  if (!layout.includes("export const metadata")) {
    throw new Error("layout.tsx should export Next metadata");
  }

  if (!home.includes('"@type": "WebSite"') || !home.includes('"@type": "Organization"')) {
    throw new Error("Home page should include WebSite and Organization JSON-LD");
  }

  if (!nextConfig.includes("/download") || !nextConfig.includes("/mini-program")) {
    throw new Error("next.config.ts should redirect legacy download and mini-program routes");
  }

  const websiteText = [
    layout,
    home,
    await readFile(fromRoot("apps/website/app/globals.css"), "utf8"),
    await readFile(fromRoot("apps/website/lib/site.ts"), "utf8"),
  ].join("\n");

  if (websiteText.includes("meme-esports-hero.png")) {
    throw new Error("Website should not reference source PNG meme-esports-hero.png");
  }

  console.log("Website checks passed.");
}

function assertMiniprogram() {
  const script = fromRoot("scripts/miniprogram/verify-pages.js");
  const result = spawnSync(process.execPath, [script], {
    cwd: ROOT,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error("Miniprogram page verification failed");
  }

  console.log("Miniprogram checks passed.");
}

async function assertAdmin() {
  for (const file of ADMIN_REQUIRED_FILES) {
    await assertFileExists(file);
  }
  console.log("Admin checks passed.");
}

async function assertServer() {
  for (const file of SERVER_REQUIRED_FILES) {
    await assertFileExists(file);
  }
  console.log("Server checks passed.");
}

async function assertMiniprogramDocs() {
  for (const file of MINIPROGRAM_DOC_FILES) {
    await assertFileExists(file);
  }
}

await assertWebsite();
assertMiniprogram();
await assertAdmin();
await assertServer();
await assertMiniprogramDocs();
console.log("All checks passed.");
