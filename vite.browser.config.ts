import path from "node:path";
import { defineConfig, Plugin } from "vite";
import solidPlugin from "vite-plugin-solid";

const replaceNwRequirePlugin: Plugin = {
  name: "replace-nw-require",
  transform(code, id, options) {
    // Replace nw.require() with require() in JS/TS/TSX files
    if (id.endsWith(".js") || id.endsWith(".ts") || id.endsWith(".tsx")) {
      return code
        .replace(/\bnw\.require\s*\(/g, "require(");
    }
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [solidPlugin(), replaceNwRequirePlugin],
  build: {
    assetsDir: ".",
    outDir: process.env.BUILD_DIRECTORY || "dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        sourcemapPathTransform:
          (relativeSourcePath, sourcemapPath) => `file://${
            path.resolve(path.dirname(sourcemapPath), relativeSourcePath)}`,
        format: "es",
        inlineDynamicImports: false,
      },
    },
    target: "esnext",
  },
  server: {
    port: parseInt(process.env.PORT || "3000"),
    strictPort: true,
  },
});
