import {NWJSManifest} from "nwts-tools/lib/types/nwjs_manifest";

import package_json from "./package.json";

let { name, displayName, dependencies } = package_json;
if (! displayName) { displayName = name; }

const chromium_args = [
  // "--mixed-context",
  // "--force-dark-mode",
  "--javascript-harmony",
  "--audio-process-high-priority",
  "--disable-background-timer-throttling",
  "--autoplay-policy=no-user-gesture-required",
  "--disable-gesture-requirement-for-presentation",
  // "--disable-web-security",
  "--allow-insecure-localhost",
  // "--mac-loopback-audio-for-cast",
  // "--mac-loopback-audio-for-screen-share",
  // "--enable-features=MacLoopbackAudioForCast,MacLoopbackAudioForScreenShare",
  // "--allow-file-access-from-files",
  // "--allow-file-access-from-file-urls",
  "--allow-running-insecure-content",
  // "--allow-running-insecure-content-from-file-urls",
  // "--allow-running-insecure-content-from-files",
  // "--allow-running-insecure-content-from-file-urls",
  // "--disable-features=ProcessPerSiteUpToMainFrameThreshold",
  "--enable-features=NetworkServiceInProcess",
  "--autoplay-policy=no-user-gesture-required",
  //"--disable-get-user-media", "--disable-app-content-verification",
  "--enable-usermedia-audio-capture --enable-blink-features=WebRTC",
  // "--enable-features=UnsafeWebGPU",
  // "--ignore-gpu-blocklist", "--disable-gpu-driver-bug-workarounds"
  // "--disable-accelerated-video-decode"
];

export const manifest: NWJSManifest = {
  name: process.env.NODE_ENV === "development"
          ? `${displayName} (dev) - nw@${dependencies.nw}`
          : displayName,
  domain: name,
  main: process.env.NODE_ENV === "development" && ! process.env.DEBUG
          ? `http://localhost:${process.env.PORT}`
          : "index.html",
  window: {
    width: 750,
    height: 590,
    position: "center",
    min_width: 638,
    min_height: 438
  },
  "chromium-args": chromium_args.join(" "),
  nodejs: true,
  "node-remote": ["http://127.0.0.1", "http://localhost", "<all_urls>"],
  // host_permissions: ["http://*/*", "https://*/*"],
  permissions: [
    "desktopCapture",
    "audioCapture",
    "tabCapture",
    "tabs",
    "<all_urls>",
  ],
};
