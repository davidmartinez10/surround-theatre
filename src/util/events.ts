import fs from "nwts-tools/lib/node/fs";
import path from "nwts-tools/lib/node/path";
import { parse } from "cue-parser";
import { loudnorm_first_pass } from "./ffmpeg";
import { get_metadata } from "./ffmpeg";
import { refresh_player, video } from "../VideoPlayer";
import { default_state, set_state, state } from "./db";
import { unwrap } from "solid-js/store";

export async function filename_change(filename: string) {
    if (! filename) return;
    for (const k of (Object.keys(state) as unknown as (keyof typeof state)[])) {
      if (k !== "virtualizer") {
        delete state[k];
        (state[k] as any) = default_state[k];
      }
    }
    // document.getElementsByTagName("img")[0].src = "";
    video.poster = "";
    refresh_player(true);
  
    if (path.extname(filename) === ".cue") {
      const data = await fs.promises.readFile(filename, { encoding: "utf8" });
  
      const o = parse(data);
  
      if ((o.files || []).length === 1) {
        for (const f of o.files!) {
          process.nextTick(async function callback() {
            await loudnorm_first_pass(path.join(path.dirname(filename), f.name));
          });
        }
        const [file] = o.files!;
        set_state({ path: path.join(path.dirname(filename), file.name), tracks: file.tracks!.map(function callbackfn(value) {
          const { title, performer } = value;
          const { min, sec }         = value.indexes![0].time;
          const start_time           = sec + ((min * 60) || 0);
          return {
            title,
            performer,
            start_time,
          };
        }) });
      }
    } else {
      set_state({ path: filename });
    }
    const metadata = await get_metadata(unwrap(state).path);
  
    if (metadata?.chapters?.length > 0) {
        set_state({ tracks: metadata.chapters.map(function callbackfn(
        value: Record<string, (string & { title: string })>) {
        return {
          start_time: Number(value.start_time),
          title: value?.tags?.title,
        };
      }) });
    }
  
    const audio_streams = metadata.streams.filter(function(
      e: { codec_type: string; }) { return e.codec_type === "audio" });
  
    state.audio_stream = audio_streams
                           .sort(function(a: { channels: number; }, b: {
                             channels: number;
                           }) { return a.channels - b.channels; })
                           .pop()
                           ?.index;
  
    const video_streams = metadata.streams.filter(function(
      e: { codec_type: string; }) { return e.codec_type === "video" });
  
    const vstream = video_streams.shift();
  
    state.reencode_video 
    // = true;
      = ! ["h264", "vp8", "vp9", "mjpeg"].includes(vstream?.codec_name);
  
    if (vstream?.codec_name) {
      if (vstream?.codec_name === "mjpeg") {
        process.nextTick(async function callback() {
          const { stdout }
          = await promises.exec(`${JSON.stringify(ffmpeg)} -f mjpeg -i ${
                                  JSON.stringify(state.file)} -an -f mjpeg -`,
                                { encoding: "buffer" });
          state.static_bitmap = stdout;
          const src           = URL.createObjectURL(new Blob([stdout]));
          // document.getElementsByTagName("img")[0].src = src;
          video.poster = src;
        });
      } else {
        state.video_stream = vstream?.index;
      }
    } else {
      const dir_contents = await fs.promises.readdir(path.dirname(filename));
  
      const images = dir_contents.filter(function predicate(value) {
        return [".jpeg", ".jpg", ".png"].includes(path.extname(value));
      });
  
      if (images.length > 0) {
        video.poster
          = "file://"
            + path.join(path.dirname(filename),
                        images.find(function predicate(value) {
                          return value.toLowerCase().includes("cover");
                        }) || images[0]);
      }
    }
  
    state.duration = Number(metadata.format.duration);
    process.nextTick(refresh_player);
  }