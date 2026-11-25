import package_json from "../package.json";
import { file_input } from "./file_input";

export function create_menu() {
  const menu = new nw.Menu({ type: "menubar" });
  if (process.platform === "darwin") {
    menu.createMacBuiltin(package_json.displayName, {
      hideEdit: true,
      hideWindow: false,
    });
  }

  const file_menu = new nw.Menu();
  file_menu.append(
    new nw.MenuItem({
      label: "New",
      key: "n",
      modifiers: process.platform === "darwin" ? "cmd" : "ctrl",
      click: function () {
        console.log("New");
      },
    }),
  );
  file_menu.append(
    new nw.MenuItem({
      label: "Open",
      key: "o",
      modifiers: process.platform === "darwin" ? "cmd" : "ctrl",
      click: function () {
        console.log("open");
        file_input.click();
      },
    }),
  );

  file_menu.append(new nw.MenuItem({ type: "separator" }));

  if (process.platform === "darwin") {
    menu.insert(new nw.MenuItem({ label: "File", submenu: file_menu }), 1);
  } else {
    menu.append(new nw.MenuItem({ label: "File", submenu: file_menu }));
  }

  nw.Window.get().menu = menu;
}
