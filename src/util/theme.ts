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
  var { default: xel } = await import("xel/xel.js");

  // @ts-ignore
  xel.theme = `file://${path.join(process.cwd(), "themes/cupertino-dark.css")}`;
  // @ts-ignore
  xel.icons = [`file://${path.join(process.cwd(), "icons/fluent.svg")}`];
  xel.size  = "medium";

  const accent    = await get_accent_color();
  xel.accentColor = accent;
}
