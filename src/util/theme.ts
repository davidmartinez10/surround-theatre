import os from "nwts-tools/lib/node/os";
import path from "nwts-tools/lib/node/path";

import {colors} from "./constants";
import {proper_exec} from "./proper_spawn";

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

  switch (os.platform()) {
  case "darwin":
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      xel.theme = "node_modules/xel/themes/cupertino-dark.css";
    } else {
      xel.theme = "node_modules/xel/themes/cupertino.css";
    }
    xel.icons = ["node_modules/xel/icons/fluent.svg"];
    xel.size  = "medium";

    const accent    = await get_accent_color();
    xel.accentColor = accent;
    window.matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", function(event) {
        if (event.matches) {
          xel.theme = "node_modules/xel/themes/cupertino-dark.css";
        } else {
          xel.theme = "node_modules/xel/themes/cupertino.css";
        }
      });
    break;
  case "win32":
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      xel.theme = "node_modules/xel/themes/fluent-dark.css";
    } else {
      xel.theme = "node_modules/xel/themes/fluent.css";
    }
    xel.icons = "node_modules/xel/icons/fluent.svg";
    xel.size  = "medium";
    window.matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", function(event) {
        if (event.matches) {
          xel.theme = "node_modules/xel/themes/fluent-dark.css";
        } else {
          xel.theme = "node_modules/xel/themes/fluent.css";
        }
      });
    break;
  default:
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      xel.theme = `file://${
        path.join(process.cwd(),
                  "node_modules/xel/themes/cupertino-dark.css")}`;
    } else {
      xel.theme = "node_modules/xel/themes/adwaita.css";
    }
    xel.icons = [`file://${
      path.join(process.cwd(), "node_modules/xel/icons/fluent.svg")}`];
    // xel.icons = "node_modules/xel/icons/material.svg";
    xel.size = "medium";
    window.matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", function(event) {
        if (event.matches) {
          xel.theme = "node_modules/xel/themes/adwaita-dark.css";
        } else {
          xel.theme = "node_modules/xel/themes/adwaita.css";
        }
      });
    break;
  }
}
