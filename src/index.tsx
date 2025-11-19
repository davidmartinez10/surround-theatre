import style from "./App.module.css";
import "./index.css";

import os from "nwts-tools/lib/node/os";
import { render } from "solid-js/web";

import { manifest } from "../nwts.manifest";
import App from "./App";
import { state } from "./state";
import { chapters_db, queue_db } from "./util/db";
import { get_metadata } from "./util/ffmpeg";

function dropzone() {

    document.body.ondragover = function (e) {
        e.preventDefault();
        e.stopPropagation();

        document.body.classList.add(style.dragging);
        e.dataTransfer!.dropEffect = "copy";
    }


    document.body.ondragleave = function (e) {
        e.preventDefault();
        e.stopPropagation();

        document.body.classList.remove(style.dragging);
    }

    document.body.ondrop = function (e) {
        e.preventDefault();
        e.stopPropagation();

        document.body.classList.remove(style.dragging);

        const files = e.dataTransfer!.files;
        console.log("Files dropped:", files);
        queue_db.bulkDocs(Array.from(files).map(function (file, index) {

            if (index === 0) {
                state.file = file.path;
                get_metadata(file.path).then((metadata) => {

                    if (metadata?.chapters?.length > 0) {
                        chapters_db.bulkDocs(metadata.chapters.map(function callbackfn(
                            value: Record<string, (string & { title: string })>) {
                            return {
                                start_time: Number(value.start_time),
                                title: value?.tags?.title,
                                file_path: file.path,
                            };
                        }));
                        state.tracks = metadata.chapters.map(function callbackfn(
                            value: Record<string, (string & { title: string })>) {
                            return {
                                start_time: Number(value.start_time),
                                title: value?.tags?.title,
                            };
                        });
                    }
                });
            }

            return ({
                track: `${index + 1}`.padStart(2, '0'),
                name: file.name,
            });
        }));

    }
}

const win = nw.Window.get()
win.on('new-win-policy', function (frame, url, policy) {
    console.log(url);
    nw.Shell.openExternal(url!);
    policy?.ignore(); // This prevents the new window from opening
});
const root = document.createElement("div") as HTMLElement;
dropzone();
document.body.appendChild(root);

async function main() {
    const { default: xel } = await import("xel/xel.js");

    switch (os.platform()) {
        case "win32":
            xel.theme = "node_modules/xel/themes/fluent-dark.css";
            xel.iconsets = [
                "node_modules/xel/iconsets/fluent-outlined.svg",
            ];
            break;
        case "aix":
            xel.theme = "node_modules/xel/themes/adwaita-dark.css";
            xel.iconsets = ["node_modules/xel/iconsets/material.svg"];
            break;
        case "darwin":
        default:
            xel.theme = "node_modules/xel/themes/cupertino-dark.css";
            xel.iconsets = ["node_modules/xel/iconsets/material.svg"];
    }
    // xel.size = "small";

    if (manifest?.name) {
        var title = document.querySelector("title");
        if (title) title.innerText = manifest.name;
    }
    // await new Promise((resolve) => setTimeout(resolve, 1e3));

    render(() => <App />, root);
    if (import.meta.env.DEV) {
        win.showDevTools();
        console.log("DevTools opened");
        nw.Window.getAll(function ([win]) {
            setTimeout(function () {
                win.focus();
            }, 1500);
        });

    }
}
main();

