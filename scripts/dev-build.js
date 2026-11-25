import "../nwts.env.js";

import child_process from "child_process";
import fs from "fs";
import os from "os";
// import {proper_spawn} from "nwts-tools/dist/lib/proper-spawn.js";
function proper_spawn(command, cwd = process.cwd(),
                      shell
                      = os.platform() === "win32" ? "powershell" : "bash") {

  const [cmd, ...args] = command.replaceAll("\\ ", "\n").split(" ");
  const basename       = cmd.match(/^.*?[\\/]([^\\/]+)$/)?.[1] || cmd;
  console.info(`$ \x1b[33m${basename} ${args.join(" ")}\x1b[0m`);

  const child
    = child_process.spawn(cmd,
                          args.map(function callbackfn(
                            value) { return value.replaceAll("\n", " "); }),
                          {
                            shell,
                            cwd,
                            env: process.env,
                            // [stdin, stdout, stderr, extra]
                            stdio: ["pipe", "pipe", "pipe"],
                          });

  const promise
    = new Promise(function(resolve, reject) { child.on("close", resolve); })

  promise.child = child;

  return promise;
}

process.env.DEBUG          = "true";
process.env.VITE_SOURCEMAP = "true";

await proper_spawn(`npx vite build --mode development --minify false`);

const args
  = JSON.parse(
      await fs.promises.readFile(`${process.env.BUILD_DIRECTORY}/package.json`),
      )["chromium-args"]
    || "";

console.log(args);

async function init() {
  while (true) {
    const dir_handle = await fs.promises.opendir(process.env.BUILD_DIRECTORY);
    for await (const entry of dir_handle) {
      if (entry.isFile() && entry.name.endsWith(".js")) { return; }
    }

    await new Promise(function(resolve) { setTimeout(resolve, 250); });
  }
}

await init();

await proper_spawn(
  `npx nw ${process.env.BUILD_DIRECTORY} --remote-debugging-port=${
    process.env.DEBUG_PORT} ${args}`,
);
