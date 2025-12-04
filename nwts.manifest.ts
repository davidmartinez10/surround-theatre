import {NWJSManifest} from "nwts-tools/lib/types/nwjs_manifest";

import package_json from "./package.json";

let { name, displayName, dependencies } = package_json;
if (! displayName) { displayName = name; }

const chromium_args = [

  "--mixed-context", "--force-dark-mode", "--javascript-harmony",
  "--audio-process-high-priority", "--disable-background-timer-throttling",
  "--autoplay-policy=no-user-gesture-required",
  "--disable-gesture-requirement-for-presentation",
  "--disable-web-security",
  "--allow-insecure-localhost",
  "--mac-loopback-audio-for-cast", "--mac-loopback-audio-for-screen-share",
  "--enable-features=MacLoopbackAudioForCast,MacLoopbackAudioForScreenShare",
  "--autoplay-policy=no-user-gesture-required",
  
];

export const manifest: NWJSManifest = {
  name: process.env.NODE_ENV === "development" ? `${displayName} (dev) - nw@${dependencies.nw}`
                                               : displayName,
  domain: name,
  main: process.env.NODE_ENV === "development" && ! process.env.DEBUG
          ? `http://localhost:${process.env.PORT}`
          : "index.html",
  window: {
    width: 500,
    height: 500,
    position: "center",
  },
  "chromium-args": chromium_args.join(" "),
   nodejs: true,
  "node-remote":
    ["http://127.0.0.1", "http://localhost"], // `chrome-extension://${name}`
  "host_permissions": ["http://*/*", "https://*/*"],
  "permissions": ["desktopCapture", "audioCapture", "tabCapture", "tabs"]
};
