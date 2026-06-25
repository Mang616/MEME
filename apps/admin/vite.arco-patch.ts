import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import type { Plugin as EsbuildPlugin } from "esbuild";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
export const ARCO_REACT_DOM_PATCH = path.resolve(ROOT, "src/shims/arco-react-dom.ts");
const ARCO_PKG = `${path.sep}@arco-design${path.sep}web-react${path.sep}`;
const SHIM = `${path.sep}shims${path.sep}arco-react-dom`;
const ARCO_ES_REACT_DOM = /[\\/]@arco-design[\\/]web-react[\\/]es[\\/]_util[\\/]react-dom\.js$/;

function isArcoEsReactDom(source: string) {
  const normalized = source.replace(/\\/g, "/");
  if (normalized.includes("/lib/_util/react-dom")) return false;
  if (normalized.includes("@arco-design/web-react/es/_util/react-dom")) return true;
  return (
    normalized === "../_util/react-dom" ||
    normalized === "../../_util/react-dom" ||
    normalized === "../react-dom" ||
    normalized === "./react-dom" ||
    (normalized.endsWith("/_util/react-dom") && !normalized.includes("/lib/")) ||
    (normalized.endsWith("/_util/react-dom.js") && !normalized.includes("/lib/"))
  );
}

function resolveArcoReactDomPatch(source: string, importer?: string) {
  if (importer?.includes(SHIM)) return null;
  if (!isArcoEsReactDom(source)) return null;

  const fromArco =
    source.replace(/\\/g, "/").includes("@arco-design/web-react/es/") ||
    Boolean(importer?.includes(ARCO_PKG));

  return fromArco ? ARCO_REACT_DOM_PATCH : null;
}

async function loadShim() {
  return fs.promises.readFile(ARCO_REACT_DOM_PATCH, "utf8");
}

/** 预构建时直接替换 Arco 的 react-dom 源文件，避免内联未补丁版本 */
export function optimizeDepsEsbuildPatch(): EsbuildPlugin {
  return {
    name: "patch-arco-react-dom-deps",
    setup(build) {
      build.onLoad({ filter: ARCO_ES_REACT_DOM }, async () => ({
        contents: await loadShim(),
        loader: "ts",
        resolveDir: path.dirname(ARCO_REACT_DOM_PATCH),
      }));

      build.onResolve({ filter: /_util\/react-dom/ }, (args) => {
        const patched = resolveArcoReactDomPatch(args.path, args.importer);
        return patched ? { path: patched } : undefined;
      });
    },
  };
}

export function patchArcoReactDom(): Plugin {
  return {
    name: "patch-arco-react-dom",
    enforce: "pre",
    resolveId(source, importer) {
      return resolveArcoReactDomPatch(source, importer ?? undefined);
    },
    load(id) {
      if (id === ARCO_REACT_DOM_PATCH || id.replace(/\\/g, "/").endsWith("/shims/arco-react-dom.ts")) {
        return loadShim();
      }
      return null;
    },
  };
}
