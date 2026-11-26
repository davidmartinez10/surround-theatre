import {ChildProcess} from "child_process";
import child_process from "nwts-tools/lib/node/child_process";
import os from "nwts-tools/lib/node/os";
import path from "nwts-tools/lib/node/path";
import {Readable} from "stream";

import {refresh_player} from "../VideoPlayer";

import {Meta, metadata_db, state, State} from "./db";
import {filter_complex} from "./filters";
import {escape_path, proper_exec, proper_spawn} from "./proper-spawn";

export const ffmpeg
  = path.join("ffmpeg", "ffmpeg") + (os.platform() === "win32" ? ".exe" : "");
export const ffprobe
  = path.join("ffmpeg", "ffprobe") + (os.platform() === "win32" ? ".exe" : "");
console.log(1, ffmpeg, ffprobe, path.join("ffmpeg", "ffmpeg"));
const loudness_settings = "I=-16:TP=-1.5:LRA=11";

export async function get_metadata(filename: string) {
  const { stdout } = await proper_exec(
    `${escape_path(ffprobe)} -of json -show_chapters -show_format -show_entries stream -hide_banner -i ${escape_path(filename)}`,
  );
  return JSON.parse(stdout as unknown as string) as any;
}

let loudnorm_cache = {} as {
  [k: string]: Record<Partial<State["binaural_renderer"]["filename"]>, boolean>;
};

export function loudnorm_first_pass(filename: string) {
  const hrir = state?.binaural_renderer;
  if (! filename || loudnorm_cache[filename]?.[hrir?.filename]) {
    return Promise.resolve();
  }
  if (! loudnorm_cache[filename])
    loudnorm_cache[filename] = {} as (typeof loudnorm_cache)[string];
  loudnorm_cache[filename][hrir?.filename] = true;
  return new Promise(async function executor(resolve) {
    let metadata
      = ((await metadata_db.get(filename).catch(() => {})) || {}) as Meta;
    if (path.extname(filename) === "cue"
        || (metadata as Meta)?.loudnorm?.[hrir?.filename])
      return resolve(metadata);

    const { streams } = (await get_metadata(filename)) || {};

    const audio_stream
      = streams
          .filter(function(
            e: { codec_type: string; }) { return e.codec_type === "audio"; })
          .sort(function(
            a: { channels: number; },
            b: { channels: number; },
          ) { return a.channels - b.channels; })
          .pop()
          ?.index;

    const args = [
      "-hide_banner",
      "-err_detect",
      "ignore_err",
      "-i",
      escape_path(filename),
    ];

    if (state.binaural_renderer.type === "sofa") {
      args.push(
        "-af",
        `"sofalizer=sofa='${
          path
            .join(
              process.cwd(),
              "sofa",
              state.binaural_renderer.filename,
              )
            .replaceAll("\\", "/")
            .replaceAll(":", "\\:")}'"`,
      );
    } else if (state.binaural_renderer.type === "hrir") {
      args.push(
        "-i",
        escape_path(
          path.join(process.cwd(), "hrir", state.binaural_renderer.filename),
          ),
        await filter_complex(),
      );
    }

    const ffmpeg_process = proper_spawn(
      `${escape_path(ffmpeg)} ${
        args.join(
          " ",
          )} -vn -acodec pcm_s16le -f matroska -`,
    );

    const measuring_process = child_process.exec(
      `${
        JSON.stringify(
          ffmpeg,
          )} -hide_banner -err_detect ignore_err -i - -af loudnorm=${
        loudness_settings}:print_format=json -f null -`,
      {
        cwd: process.cwd(),
        shell: os.platform() === "win32" ? "powershell" : "bash",
      },
    );

    ffmpeg_process.stdout?.pipe(measuring_process.stdin!);

    let cache = [] as string[];

    measuring_process.stderr?.on("data",
                                 function(data) { cache.push(String(data)); });

    measuring_process.stderr?.on("close", function() {
      const { input_i, input_lra, input_tp, input_thresh, target_offset }
      = JSON.parse("{" + cache.join("").split("{").pop());

      const loudnorm = {
        input_i,
        input_lra,
        input_tp,
        input_thresh,
        target_offset,
      };

      if (metadata?.loudnorm) {
        metadata.loudnorm[state.binaural_renderer.filename] = loudnorm;
      } else {
        metadata.loudnorm = {
          [state.binaural_renderer.filename]: loudnorm,
        } as Meta["loudnorm"];
      }
      if (loudnorm) {
        metadata_db.put({
          ...metadata,
          _id: state.path,
        });

        if (filename === state.path && hrir === state.binaural_renderer) {
          process.nextTick(refresh_player);
        }
      }
      ffmpeg_process.stdin.destroy();
      ffmpeg_process.stdout.destroy();
      ffmpeg_process.stderr.destroy();
      ffmpeg_process.kill();
      measuring_process?.stdin?.destroy();
      measuring_process?.stdout?.destroy();
      measuring_process?.stderr?.destroy();
      measuring_process.kill();
      process.kill(-ffmpeg_process.pid!, "SIGKILL");
      process.kill(-measuring_process.pid!, "SIGKILL");
      if (os.platform() === "win32") {
        proper_exec(`taskkill /pid ${ffmpeg_process.pid} /T /F`);
        proper_exec(`taskkill /pid ${measuring_process.pid} /T /F`);
      } else {
        proper_exec(`kill -9 ${ffmpeg_process.pid}`);
        proper_exec(`kill -9 ${measuring_process.pid}`);
      }
      return resolve(metadata);
    });
  });
}

export async function start_ffmpeg_process(
  filename: string,
  ): Promise<ChildProcess> {
  const {
    video_codec,
    audio_codec,
    video_stream,
    audio_stream,
    reencode_video,
    binaural_renderer,
    path: state_path,
    current_position,
  } = state;
  var metadata: Meta|undefined;
  try {
    metadata = (await metadata_db.get(state_path)) as Meta;
  } catch (error) { console.error(error); }
  let loudnorm = "";

  if (metadata?.loudnorm?.[binaural_renderer.filename]) {
    const { input_i, input_lra, input_tp, input_thresh, target_offset }
    = metadata.loudnorm[binaural_renderer.filename];
    loudnorm = `${loudness_settings}:measured_I=${input_i}:measured_LRA=${
      input_lra}:measured_TP=${input_tp}:measured_thresh=${
      input_thresh}:offset=${target_offset}:linear=true`;
  } else {
    loudnorm = loudness_settings;
    loudnorm_first_pass(filename);
  }

  var args = [
    "-hide_banner",
    "-err_detect",
    "ignore_err",
    "-re",
    "-i",
    escape_path(filename),
  ];

  if (binaural_renderer.type === "sofa") {
    args.push(
      "-af",
      `"sofalizer=sofa='${
        path
          .join(
            process.cwd(),
            "sofa",
            binaural_renderer.filename,
            )
          .replaceAll("\\", "/")
          .replaceAll(":", "\\:")}'"`,
      "-map",
      JSON.stringify(`0:${audio_stream}`),
    );
  } else if (binaural_renderer.type === "hrir") {
    args.push(
      "-i",
      escape_path(path.join(process.cwd(), "hrir", binaural_renderer.filename)),
      await filter_complex(loudnorm),
    );
  }

  // args.push(
  //   // "-probesize",
  //   // "32",
  //   // "-analyzeduration",
  //   // "0",
  //   // "-fflags",
  //   // "nobuffer",
  //   "-fflags",
  //   "discardcorrupt",
  //   "-flags",
  //   "low_delay",
  // );

  if (Number.isSafeInteger(video_stream) && video_stream >= 0) {
    args.push(
      "-map",
      `0:${video_stream}`,
      "-vcodec",
      reencode_video ? "libxvid -qp 0" // -preset ultrafast -tune zerolatency"
                     : "copy",
    );
  } else {
    args.push("-vn");
  }

  args.push(
    "-acodec",
    "pcm_s16le",
    // "flac",
    "-ar",
    "44100",
    // "-strict",
    // "experimental",
    "-f",
    "matroska",
  );

  if (current_position) {
    const date = new Date(0);
    date.setSeconds(current_position);
    args.unshift("-ss", date.toISOString().substr(11, 8));
  }

  args.push("-");

  const ffmpeg_process_raw = proper_spawn(
    `${escape_path(ffmpeg)} ${args.join(" ")}`,
  );

  if (ffmpeg_process_raw.stderr) {
    var final_bitrate: number;
    var bitrates = [] as number[];
    (ffmpeg_process_raw.stderr as Readable).on("data", function data(chunk) {
      console.debug(String(chunk));
      if (final_bitrate) { return; }
      const bitrate = String(chunk)
                        .split(" ")
                        .filter(Boolean)
                        .find((e) => e.startsWith("bitrate="))
                        ?.split("=")[1]
                        ?.replace("kbits/s", "")
                      || "";
      if (bitrate) {
        const rate = Math.round(Number(bitrate) / 100) * 100;
        if (bitrates?.length > 3 && rate > 0) {
          const [bitrate1, bitrate2, bitrate3] = bitrates.slice().reverse();
          console.log(bitrate1, bitrate2, bitrate3);
          if ([bitrate1, bitrate2, bitrate3].every((e) => e === rate)) {
            console.log({ bitrate: `~${rate}kbps` });
            final_bitrate = rate;
            return;
          }
        }
        bitrates.push(rate);
      }
    });
  }

  if (binaural_renderer.type === "hrir") { return ffmpeg_process_raw; }

  return loudnorm_pipe(ffmpeg_process_raw, loudnorm);
}

function loudnorm_pipe(
  ffmpeg_process_raw: ChildProcess,
  loudnorm: string,
  ): ChildProcess {
  var args = [
    "-hide_banner",
    "-err_detect",
    "ignore_err",
    "-re",
    "-i",
    "-",
    // "-probesize",
    // "32",
    // "-analyzeduration",
    // "0",
    // "-fflags",
    // "nobuffer",
    "-fflags",
    "discardcorrupt",
    "-flags",
    "low_delay",
    "-acodec",
    "pcm_s16le",
    // "flac",
    "-ar",
    "44100",
    "-af",
    `loudnorm=${loudnorm}`,
    "-vcodec",
    "copy",
    // "-vn",
    // "-strict",
    // "experimental",
    "-f",
    "matroska",
    "-",
  ];
  const ffmpeg_process = proper_spawn(
    `${escape_path(ffmpeg)} ${args.join(" ")}`,
  );

  ffmpeg_process_raw?.stdout?.pipe(ffmpeg_process.stdin!);

  if (ffmpeg_process.stderr) {
    (ffmpeg_process.stderr as Readable)
      .on("data", function data(chunk) { console.debug(String(chunk)); });
  }

  return ffmpeg_process;
}
