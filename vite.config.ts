import {execSync} from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {defineConfig, Plugin} from "vite";
import solidPlugin from "vite-plugin-solid";

import {manifest} from "./nwts.manifest";

const replaceRequirePlugin: Plugin = {
  name: "replace-require",
  transform(code, id, options) {
    console.log("options", options);
    // Replace require("node:module") with require("module") anywhere in
    // JS/TS/TSX files Use word boundaries to avoid partial matches in
    // strings/comments
    if (id.endsWith(".js") || id.endsWith(".ts") || id.endsWith(".tsx")) {
      return code
        .replace(/\brequire\s*\(\s*"node:([^"]+)"\s*\)/g, "require(\"$1\")")
        .replace(/\brequire\s*\(\s*'node:([^']+)'\s*\)/g, "require('$1')")
        // Existing logic to wrap regular require() with nw.require(), but
        // exclude already-wrapped ones
        .replace(/(?<!nw\.)require\(/g, "nw.require(");
    }
  }
};

const nwts_plugin = {
  async options() {
    const package_json
      = JSON.parse(await fs.promises.readFile("./package.json", "utf-8"));

    if (package_json?.bundleDependencies && package_json?.dependencies) {
      Object.assign(manifest, {
        dependencies: Object.fromEntries(
          Object.entries(package_json.dependencies).filter(function(value) {
            return package_json.bundleDependencies.includes(value[0]);
          }))
      });
    }

    if (! fs.existsSync("public")) { fs.mkdirSync("public"); }
    if (! fs.existsSync(process.env.BUILD_DIRECTORY)) {
      fs.mkdirSync(process.env.BUILD_DIRECTORY);
    }
    await fs.promises.writeFile(path.join("public", "package.json"),
                                JSON.stringify(manifest));
    await fs.promises.writeFile(path.join("build", "package.json"),
                                JSON.stringify(manifest));
    await fs.promises.cp(path.join("ffmpeg", os.platform(), os.arch()),
                         path.join(process.env.BUILD_DIRECTORY, "ffmpeg"),
                         { recursive: true })
    execSync(`npm install`,
             { stdio: "inherit", cwd: path.join(process.cwd(), "public") });
  }
} as unknown as Plugin;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [solidPlugin(), nwts_plugin], //, replaceRequirePlugin],
  build: {
    assetsDir: ".",
    outDir: process.env.BUILD_DIRECTORY,
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        sourcemapPathTransform:
          (relativeSourcePath, sourcemapPath) => `file://${
            path.resolve(path.dirname(sourcemapPath), relativeSourcePath)}`,
        format: "module",
        inlineDynamicImports: true,
      },
    },
  },
});
