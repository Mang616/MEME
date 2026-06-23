import { readFile, stat } from "node:fs/promises";

const requiredFiles = [
  "apps/website/index.html",
  "apps/website/delta-force/index.html",
  "apps/website/styles.css",
  "apps/website/site.js",
  "apps/website/robots.txt",
  "apps/website/sitemap.xml",
  "apps/website/assets/meme-esports-hero-1600.jpg",
  "apps/website/assets/meme-esports-hero-900.jpg",
  "packages/theme/tokens.css"
];

for (const file of requiredFiles) {
  await stat(file);
}

const home = await readFile("apps/website/index.html", "utf8");
const delta = await readFile("apps/website/delta-force/index.html", "utf8");

for (const [name, html] of [["home", home], ["delta-force", delta]]) {
  if (!html.includes("<title>")) throw new Error(`${name} is missing title`);
  if (!html.includes('name="description"')) throw new Error(`${name} is missing meta description`);
  if (!html.includes('application/ld+json')) throw new Error(`${name} is missing structured data`);
}

if (home.includes("meme-esports-hero.png") || delta.includes("meme-esports-hero.png")) {
  throw new Error("Website pages should use compressed JPG assets, not the source PNG");
}

for (const [name, html] of [["home", home], ["delta-force", delta]]) {
  if (!html.includes('name="keywords"')) throw new Error(`${name} is missing meta keywords`);
  if (!html.includes("<h1")) throw new Error(`${name} is missing h1`);
}

if (!home.includes('"@type": "WebSite"')) {
  throw new Error("Home page should include WebSite structured data");
}

if (!delta.includes('"@type": "FAQPage"')) {
  throw new Error("Delta-force page should include FAQPage structured data");
}

console.log("Website checks passed.");
