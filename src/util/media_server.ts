import child_process from "nwts-tools/lib/node/child_process";
import http from "nwts-tools/lib/node/http";
import os from "nwts-tools/lib/node/os";

import { ffmpeg, start_ffmpeg_process} from "./ffmpeg";
import { escape_path, proper_exec, proper_spawn } from "./proper_spawn";
import {set_state, State, state} from "./db";
import { unwrap } from "solid-js/store";


const default_state: Partial<State> = {
  hostname: "localhost",
  port: 13231,
  virtualizer: { type: "hrir", filename: "A3D.wav" },
};
set_state(default_state);

const server = http.createServer(async function media_server(req, res) {
  const { path } = unwrap(state);
  if (! path) return res.end();
  if (req.url !== "/stream.mkv") {
    return res.end();
  }

  res.setHeader("Content-Type", "video/x-matroska; codecs=pcm");
  //res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Access-Control-Allow-Origin", "*");
  let ffmpeg_process = await start_ffmpeg_process(path);
  ffmpeg_process.stdout?.pipe(res);

  function close() {
    if (os.platform() === "win32") {
      proper_exec(`taskkill /pid ${ffmpeg_process.pid} /f /t`);
    } else {
      proper_exec(`kill -9 ${ffmpeg_process.pid}`);
    }
  }

  req.on("close", close);
  req.on("end", close);
  req.on("error", close);
  req.on("pause", close);
});

server.listen(default_state.port, default_state.hostname, () => {
  console.log(`Server running at http://${default_state.hostname}:${default_state.port}/`);
});
