import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const args = new Set(process.argv.slice(2));
const host = args.has("--host") ? "0.0.0.0" : "127.0.0.1";
const port = Number(process.env.PORT || 4173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

function withinRoot(target) {
  const path = normalize(join(root, target));
  return path.startsWith(root) ? path : null;
}

async function fileExists(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function resolveFile(url = "/") {
  const path = decodeURIComponent(url.split("?")[0]);
  const routes = {
    "/": "apps/website/index.html",
    "/delta-force": "apps/website/delta-force/index.html",
    "/delta-force/": "apps/website/delta-force/index.html",
    "/robots.txt": "apps/website/robots.txt",
    "/sitemap.xml": "apps/website/sitemap.xml"
  };

  if (routes[path]) return join(root, routes[path]);

  const prefixes = [
    ["/website/", "apps/website/"],
    ["/packages/", "packages/"]
  ];

  for (const [prefix, target] of prefixes) {
    if (path.startsWith(prefix)) {
      const file = withinRoot(target + path.slice(prefix.length));
      if (file && await fileExists(file)) return file;
    }
  }

  const websiteAsset = withinRoot("apps/website/" + path.replace(/^\//, ""));
  if (websiteAsset && await fileExists(websiteAsset)) return websiteAsset;

  return null;
}

createServer(async (req, res) => {
  const file = await resolveFile(req.url);
  if (!file) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const body = await readFile(file);
  res.writeHead(200, {
    "content-type": types[extname(file)] || "application/octet-stream",
    "cache-control": "public, max-age=60"
  });
  res.end(body);
}).listen(port, host, () => {
  console.log(`MEME website preview: http://${host}:${port}`);
  console.log(`Delta Force page:     http://${host}:${port}/delta-force`);
});
