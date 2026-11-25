import {proper_exec} from "nwts-tools/dist/lib/proper-spawn";
import os from "nwts-tools/lib/node/os";
import path from "nwts-tools/lib/node/path";

import {colors} from "./constants";

export async function get_accent_color(): Promise<string> {
  var accent = "#007AFF";
  try {
    const { stdout } = await proper_exec("defaults read -g AppleAccentColor");
    accent           = colors[parseInt(stdout) || 4];
  } catch (error) { console.error("Error getting accent color:", error); }
  console.log("Accent:", accent);
  return accent;
}

export async function initialize_theme(): Promise<void> {
  // @ts-ignore
  const { default: xel } = await import("xel/xel.js");

  let theme = "adwaita";
  let icons = "material";

  if (os.platform() === "win32") {
    theme = "fluent";
    icons = "fluent";
  } else if (os.platform() === "darwin") {
    theme           = "cupertino";
    icons           = "fluent";
    const accent    = await get_accent_color();
    xel.accentColor = accent;
  }

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    xel.theme = `file://${
      path.join(process.cwd(), `node_modules/xel/themes/${theme}-dark.css`)}`;
  } else {
    xel.theme = `file://${
      path.join(process.cwd(), `node_modules/xel/themes/${theme}.css`)}`;
  }
  xel.icons = [
    `file://${path.join(process.cwd(), `node_modules/xel/icons/${icons}.svg`)}`,
  ];
  xel.size = "medium";

  window.matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function(event) {
      if (event.matches) {
        xel.theme = `file://${
          path.join(process.cwd(),
                    `node_modules/xel/themes/${theme}-dark.css`)}`;
      } else {
        xel.theme = `file://${
          path.join(process.cwd(), `node_modules/xel/themes/${theme}.css`)}`;
      }
    });
}
