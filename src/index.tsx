import style from "./App.module.css";
import "./index.css";
import { chapters_db, queue_db, set_state, State, state, state_db } from "./util/db";
import "./util/media_server";

import os from "nwts-tools/lib/node/os";
import { render } from "solid-js/web";

import { manifest } from "../nwts.manifest";
import App from "./App";
import { ffmpeg, get_metadata } from "./util/ffmpeg";
import { video } from "./VideoPlayer";
import fs from "nwts-tools/lib/node/fs";
import path from "nwts-tools/lib/node/path";
import { escape_path, proper_exec, proper_spawn } from "./util/proper_spawn";
import { unwrap } from "solid-js/store";
import { refresh_player } from "./VideoPlayer";

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

    document.body.ondrop = async function (e) {
        e.preventDefault();
        e.stopPropagation();

        document.body.classList.remove(style.dragging);

        const files = e.dataTransfer!.files;
        console.log("Files dropped:", files);

        for (const [index, file] of Array.from(files).entries()) {

            const metadata = await get_metadata(file.path);
            console.log("Metadata:", metadata);
            if (index === 0) {
                const audio_streams = metadata.streams.filter(function (
                    e: { codec_type: string; }) { return e.codec_type === "audio" });
                    console.log(audio_streams[0])

                var new_state = { ...state } as State;
                new_state.path = file.path;
                const audio_stream = audio_streams
                    .sort(function (a: { channels: number; }, b: {
                        channels: number;
                    }) { return a.channels - b.channels; })
                    .slice()
                    .pop();

                new_state.audio_streams = audio_streams;
                new_state.audio_stream = audio_stream?.index || 0;
                new_state.audio_codec = audio_stream?.codec_name || '';

                const video_streams = metadata.streams.filter(function (
                    e: { codec_type: string; }) { return e.codec_type === "video" });

                const vstream = video_streams.slice().shift();

                const reencode_video = !["h264", "vp8", "vp9", "mjpeg"].includes(vstream?.codec_name);


                if (vstream?.codec_name) {
                    if (vstream?.codec_name === "mjpeg") {
                         process.nextTick(async function callback() {
                             const { stdout } = await proper_exec(`${escape_path(ffmpeg)} -f mjpeg -i ${JSON.stringify(state.path)} -an -f mjpeg -`);
                             new_state.static_bitmap = stdout.toString();
                             const src = URL.createObjectURL(new Blob([stdout]));
                             // document.getElementsByTagName("img")[0].src = src;
                             video.poster = src;
                         });
                    } else {
                        new_state.video_stream = vstream?.index;
                        new_state.video_codec = vstream?.codec_name || '';
                        new_state.reencode_video = reencode_video;
                        new_state.video_streams = video_streams;
                    }
                } else {
                    const dir_contents = await fs.promises.readdir(path.dirname(new_state.path));

                    const images = dir_contents.filter(function predicate(value) {
                        return [".jpeg", ".jpg", ".png"].includes(path.extname(value));
                    });

                    if (images.length > 0) {
                        video.poster
                            = "file://"
                            + path.join(path.dirname(new_state.path),
                                images.find(function predicate(value) {
                                    return value.toLowerCase().includes("cover");
                                }) || images[0]);
                    }
                }

                new_state.duration = Number(metadata.format.duration);

                set_state({
                    ...new_state,
                    current_track: index,
                    current_duration: metadata?.streams[0]?.duration || 0,
                    current_position: 0,
                });
                
                refresh_player();
            }

            queue_db.put({
                track: `${index + 1}`.padStart(2, '0'),
                name: metadata?.tags?.title || file.name,
                path: file.path,
                _id: file.path+Date.now(),
            });

        }


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

