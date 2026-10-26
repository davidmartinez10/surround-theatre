import fs from "nwts-tools/lib/node/fs";
import node_path from "nwts-tools/lib/node/path";

import { refresh_player, video } from "../VideoPlayer";

import { SupportedImageExtensions, SupportedVideoCodecs } from "./constants";
import { MusicTrack, queue_db, set_state, State } from "./db";
import { ffmpeg, get_metadata } from "./ffmpeg";
import { escape_path, proper_exec } from "./proper_spawn";

const { parse } = nw.require(
  "@lightrabbit/cue-parser/lib/cue.js",
) as typeof import("@lightrabbit/cue-parser/lib/cue.js");

export async function process_cue_file(
  file_path: string,
): Promise<{ path: string; tracks?: MusicTrack[]; }> {
  const data = await fs.promises.readFile(file_path, { encoding: "utf8" });
  const o = parse(data);

  if ((o.files || []).length === 1) {
    const [real_file] = o.files!;
    const path = node_path.join(node_path.dirname(file_path), real_file.name);

    const tracks = real_file.tracks!.map(function callbackfn(value) {
      const { title, performer } = value;
      const { min, sec } = value.indexes![0].time;
      const start_time = sec + (min * 60 || 0);
      return {
        title,
        performer,
        start_time,
      } as MusicTrack;
    });

    return { path, tracks };
  }

  return { path: file_path };
}

export async function process_media_file(file_path: string): Promise<{
  path: string;
  tracks?: MusicTrack[];
  audio_streams?: any[];
  audio_stream?: number;
  audio_codec?: string;
  video_streams?: any[];
  video_stream?: number;
  video_codec?: string;
  reencode_video?: boolean;
  duration?: number;
  static_bitmap?: string;
}> {
  const new_state: Partial<State> = { path: file_path };

  const metadata = await get_metadata(file_path);
  console.log("Metadata:", metadata);

  // Process chapters/tracks from metadata
  if (metadata?.chapters?.length > 0) {
    new_state.tracks = metadata.chapters.map(function callbackfn(
      value: Record<string, string & { title: string; }>,
    ) {
      return {
        start_time: Number(value.start_time),
        title: value?.tags?.title,
      } as MusicTrack;
    });
  }

  // Process audio streams
  const audio_streams = metadata.streams.filter(function (
    e: { codec_type: string; }) { return e.codec_type === "audio"; });

  console.log("audio_streams", audio_streams);
  const audio_stream = audio_streams
    .sort(function (
      a: { channels: number; },
      b: { channels: number; },
    ) { return a.channels - b.channels; })
    .slice()
    .pop();

  new_state.audio_streams = audio_streams;
  new_state.audio_stream = audio_stream?.index;
  new_state.audio_codec = audio_stream?.codec_name || "";

  // Process video streams
  const video_streams = metadata.streams.filter(function (
    e: { codec_type: string; }) { return e.codec_type === "video"; });

  const vstream = video_streams.slice().shift();

  if (vstream?.codec_name) {
    if (vstream?.codec_name === "mjpeg") {
      process.nextTick(async function callback() {
        const { stdout } = await proper_exec(
          `${escape_path(ffmpeg)} -f mjpeg -i ${JSON.stringify(
            file_path,
          )} -an -f mjpeg -`,
        );
        new_state.static_bitmap = stdout.toString();
        const src = URL.createObjectURL(new Blob([stdout]));
        video.poster = src;
      });
    } else {
      new_state.video_stream = vstream?.index;
      new_state.reencode_video = !SupportedVideoCodecs.includes(
        vstream?.codec_name as any,
      );
      console.log(vstream?.codec_name, new_state.reencode_video);
      new_state.video_codec
        = new_state.reencode_video ? "h264" : vstream?.codec_name || "";
      new_state.video_streams = video_streams;
    }
  } else {
    // Look for cover images
    const dir_contents = await fs.promises.readdir(
      node_path.dirname(file_path),
    );
    const images = dir_contents.filter(function predicate(value) {
      return SupportedImageExtensions.includes(node_path.extname(value) as any);
    });

    if (images?.length > 0) {
      video.poster
        = "file://"
        + node_path.join(
          node_path.dirname(file_path),
          images.find(function predicate(
            value) { return value.toLowerCase().includes("cover"); })
          || images[0],
        );
    }
  }

  new_state.duration = Number(metadata?.format?.duration) || 0;

  return new_state as any;
}

export async function load_media_file(
  file: File,
  index: number,
): Promise<void> {
  let new_state = {
    ...state,
    video_streams: [],
    audio_streams: [],
  } as State;

  if (node_path.extname(file.name) === ".cue") {
    const cue_data = await process_cue_file(file.path);
    new_state.path = cue_data.path;
    new_state.tracks = cue_data.tracks || ([] as MusicTrack[]);
  } else {
    new_state.path = file.path;
  }

  const media_data = await process_media_file(new_state.path);

  if (index === 0) {
    await set_state({
      ...new_state,
      ...media_data,
      current_track: index,
      current_position: 0,
    });

    setTimeout(refresh_player, 50);
  }

  // Add to queue
  const metadata = await get_metadata(new_state.path);
  queue_db.put({
    track: `${index + 1}`.padStart(2, "0"),
    name: metadata?.tags?.title || file.name,
    path: file.path,
    _id: file.path + Date.now(),
  });
}
