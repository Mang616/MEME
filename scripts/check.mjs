import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const REQUIRED_FILES = [
  "apps/website/app/layout.tsx",
  "apps/website/app/page.tsx",
  "apps/website/app/globals.css",
  "apps/website/app/download/page.tsx",
  "apps/website/app/mini-program/page.tsx",
  "apps/website/app/order/page.tsx",
  "apps/website/app/robots.ts",
  "apps/website/app/sitemap.ts",
  "apps/website/lib/content.ts",
  "apps/website/components/entry-link.tsx",
  "apps/website/public/assets/meme-logo-96.png",
  "apps/website/public/assets/home-huhang-320.png",
  "apps/website/public/assets/home-peiwan-320.png",
  "packages/theme/tokens.css",
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

for (const file of REQUIRED_FILES) {
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

if (!layout.includes("export const metadata")) {
  throw new Error("layout.tsx should export Next metadata");
}

if (!home.includes('"@type": "WebSite"') || !home.includes('"@type": "Organization"')) {
  throw new Error("Home page should include WebSite and Organization JSON-LD");
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
