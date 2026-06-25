import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import {
  ARCO_REACT_DOM_PATCH,
  optimizeDepsEsbuildPatch,
  patchArcoReactDom,
} from "./vite.arco-patch";

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
        find: "@arco-design/web-react/es/_util/react-dom",
        replacement: ARCO_REACT_DOM_PATCH,
      },
    ],
  },
  server: {
    port: 4180,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4180,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
