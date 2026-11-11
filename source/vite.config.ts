import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** `base: "./"` deixa o site funcionar em qualquer subpasta (GitHub Pages em /ryan-ui/, por exemplo); as rotas usam hash. */
export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, ".") } },
  build: { outDir: "dist", chunkSizeWarningLimit: 900 },
  server: { port: 5199, strictPort: true, host: "127.0.0.1" },
  preview: { port: 5198, strictPort: true, host: "127.0.0.1" },
});
