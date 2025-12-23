import style from "./App.module.css";
import "./index.css";
import { MusicTrack, queue_db, set_state, State, state } from "./util/db";
import "./util/media_server";

import { render } from "solid-js/web";

import { manifest } from "../nwts.manifest";
import App from "./App";
import { ffmpeg, get_metadata } from "./util/ffmpeg";
import { video } from "./VideoPlayer";
import fs from "nwts-tools/lib/node/fs";
import path from "nwts-tools/lib/node/path";
import { escape_path, proper_exec, proper_spawn } from "./util/proper_spawn";
import { refresh_player } from "./VideoPlayer";

const colors = [
    '#FF3B30',  // Red
    '#FF9500',  // Orange
    '#FFCC00',  // Yellow
    '#34C759',  // Green
    '#007AFF',  // Blue
    '#5856D6',  // Violet
    '#FF2D55'   // Magenta
] as const;

const { parse } = nw.require("@lightrabbit/cue-parser/lib/cue.js") as typeof import("@lightrabbit/cue-parser/lib/cue.js");

function dropzone() {

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

        process.nextTick(function callback() {
            refresh_player(true);
        });

        document.body.classList.remove(style.dragging);

        const files = e.dataTransfer!.files;

        for (const [index, file] of Array.from(files).entries()) {

            var new_state = { ...state } as State;
            if (path.extname(file.name) === ".cue") {
                const data = await fs.promises.readFile(file.path, { encoding: "utf8" });

                const o = parse(data);

                if ((o.files || []).length === 1) {
                    // for (const f of o.files!) {
                    //   process.nextTick(async function callback() {
                    //     await loudnorm_first_pass(path.join(path.dirname(filename), f.name));
                    //   });
                    // }
                    const [real_file] = o.files!;
                    new_state.path = path.join(path.dirname(file.path), real_file.name);

                    new_state.tracks = real_file.tracks!.map(function callbackfn(value) {
                        const { title, performer } = value;
                        const { min, sec } = value.indexes![0].time;
                        const start_time = sec + ((min * 60) || 0);
                        return {
                            title,
                            performer,
                            start_time,
                        } as MusicTrack;
                    });
                }
            } else {
                new_state.path = file.path;
            }


            const metadata = await get_metadata(new_state.path);
            console.log("Metadata:", metadata);
            if (index === 0) {
                if (metadata?.chapters?.length > 0) {
                    new_state.tracks = metadata.chapters.map(function callbackfn(
                        value: Record<string, (string & { title: string; })>) {
                        return {
                            start_time: Number(value.start_time),
                            title: value?.tags?.title,
                        } as MusicTrack;
                    });
                }
                const audio_streams = metadata.streams.filter(function (
                    e: { codec_type: string; }) { return e.codec_type === "audio"; });

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
                    e: { codec_type: string; }) { return e.codec_type === "video"; });

                const vstream = video_streams.slice().shift();


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
                        new_state.reencode_video = !["h264", "vp8", "vp9", "hevc", "mjpeg", "mpeg2video", "mpeg4", "h263"].includes(vstream?.codec_name);
                        new_state.video_codec = new_state.reencode_video ? "h264" : vstream?.codec_name || '';
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

                new_state.duration = Number(metadata?.format?.duration) || 0;

                await set_state({
                    ...new_state,
                    current_track: index,
                    current_position: 0,
                });

                refresh_player();
            }

            queue_db.put({
                track: `${index + 1}`.padStart(2, "0"),
                name: metadata?.tags?.title || file.name,
                path: file.path,
                _id: file.path + Date.now(),
            });

        }


    };
}

const win = nw.Window.get();
win.on("new-win-policy", function (frame, url, policy) {
    console.error(url);
    nw.Shell.openExternal(url!);
    policy?.ignore(); // This prevents the new window from opening
});

const root = document.createElement("div") as HTMLElement;
dropzone();
document.body.appendChild(root);

async function main() {
    // @ts-ignore
    var { default: xel } = await import("xel/xel.js");

    // xel.theme = "/xel/themes/cupertino-dark.css";
    // xel.iconsets = ["/xel/iconsets/material.svg"];
    // @ts-ignore
    xel.theme = `file://${path.join(nw.process.cwd(), "themes/cupertino-dark.css")}`;
    // @ts-ignore
    xel.icons = [`file://${path.join(nw.process.cwd(), "icons/fluent.svg")}`];
    xel.size = "medium";
    // get accent color from the OS
    // xel.accentColor = "blue";
    var accent = '#007AFF';
    try {
        const { stdout } = await proper_exec("defaults read -g AppleAccentColor");
        accent = colors[parseInt(stdout) || 4];
    } catch (error) {
        console.error("Error getting accent color:", error);
    }
    console.log("Accent:", accent);

    xel.accentColor = accent;
    // document.head.appendChild(<meta name="xel-accent-color" content={accent} /> as HTMLMetaElement);

    if (manifest?.name) {
        var title = document.querySelector("title");
        if (title) title.innerText = manifest.name;
    }
    // await new Promise((resolve) => setTimeout(resolve, 1e3));

    render(() => <App />, root);
    if (import.meta.env.DEV) {
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

