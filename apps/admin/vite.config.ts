import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import {
  ARCO_REACT_DOM_PATCH,
  optimizeDepsEsbuildPatch,
  patchArcoReactDom,
} from "./vite.arco-patch";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const domains = JSON.parse(
  readFileSync(path.join(root, "config/domains.json"), "utf8"),
) as {
  development: { apiHost: string; apiPort: number; adminPort: number };
};

const apiDevTarget = `http://${domains.development.apiHost}:${domains.development.apiPort}`;
const adminPort = domains.development.adminPort;

export default defineConfig({
  plugins: [patchArcoReactDom(), react()],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [optimizeDepsEsbuildPatch()],
    },
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      {
        find: "@meme/vip-activity-defaults",
        replacement: path.resolve(root, "packages/vip-activity-defaults/index.js"),
      },
      {
        find: "@meme/invite-activity-defaults",
        replacement: path.resolve(root, "packages/invite-activity-defaults/index.js"),
      },
      {
        find: "@arco-design/web-react/es/_util/react-dom",
        replacement: ARCO_REACT_DOM_PATCH,
      },
    ],
  },
  server: {
    port: adminPort,
    proxy: {
      "/api": {
        target: apiDevTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: adminPort,
    proxy: {
      "/api": {
        target: apiDevTarget,
        changeOrigin: true,
      },
    },
  },
});
