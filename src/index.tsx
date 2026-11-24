import "./index.css";
import "./util/media_server";

import { render } from "solid-js/web";

import { manifest } from "../nwts.manifest";
import App from "./App";
import { initialize_dropzone } from "./util/dragdrop";
import { initialize_theme } from "./util/theme";

async function main() {
  // Initialize theme
  await initialize_theme();

  // Create root element and initialize dropzone
  const root = document.createElement("div") as HTMLElement;
  initialize_dropzone();
  document.body.appendChild(root);

  // Set window title
  if (manifest?.name) {
    const title = document.querySelector("title");
    if (title) title.innerText = manifest.name;
  }

  // Render the app
  render(() => <App />, root);

  // Open dev tools in development
  if (import.meta.env.DEV) {
    const win = nw.Window.get();
    win.showDevTools();
    console.info("DevTools opened");
    nw.Window.getAll(function ([win]) {
      setTimeout(function () {
        win.focus();
      }, 1500);
    });
  }
}
main();
