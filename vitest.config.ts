import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  // The suite covers pure modules only, so skip Vite's CSS pipeline entirely —
  // otherwise it tries (and fails) to load the Tailwind v4 PostCSS plugin.
  css: { postcss: { plugins: [] } },
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["app/**/*.test.ts"],
  },
});
