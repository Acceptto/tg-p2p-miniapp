import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",
    sourcemap: false,
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    minify: "esbuild",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
  esbuild: {
    jsx: "automatic",
    legalComments: "none",
  },
  resolve: {
    alias: {
      "@": "/src",
    },
    conditions: ["development", "browser"],
  },
});
