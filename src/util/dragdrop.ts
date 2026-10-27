import style from "../App.module.css";
import { refresh_player } from "../VideoPlayer";

import { load_media_file } from "./mediaLoader";

export function initialize_dropzone(): void {
  document.body.ondragover = function (e) {
    e.preventDefault();
    e.stopPropagation();

    document.body.classList.add(style.dragging);
    e.dataTransfer!.dropEffect = "copy";
  };

  document.body.ondragleave = function (e) {
    e.preventDefault();
    e.stopPropagation();

    document.body.classList.remove(style.dragging);
  };

  document.body.ondrop = async function (e) {
    e.preventDefault();
    e.stopPropagation();

    process.nextTick(function callback() { refresh_player(true); });

    document.body.classList.remove(style.dragging);

    const files = e.dataTransfer!.files;

    for (const [index, file] of Array.from(files).entries()) {
      await refresh_player(true);
      await load_media_file(file, index);
    }
  };
}
