import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "./",
  publicDir: "public",

  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true,
  },

  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        assetFileNames: "assets/[name].[hash].[ext]",
        chunkFileNames: "assets/[name].[hash].js",
        entryFileNames: "assets/[name].[hash].js",
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@js": fileURLToPath(new URL("./js", import.meta.url)),
      "@css": fileURLToPath(new URL("./css", import.meta.url)),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@css/style.css";`,
      },
    },
  },

  optimizeDeps: {
    include: ["html2pdf.js", "waves"],
    exclude: [],
  },
});
