import http from "nwts-tools/lib/node/http";
import os from "nwts-tools/lib/node/os";

import { start_ffmpeg_process } from "./ffmpeg";
import { proper_exec } from "./proper_spawn";
import { default_state, set_state, state } from "./db";
import { unwrap } from "solid-js/store";

set_state({ ...default_state });

const server = http.createServer(async function media_server(req, res) {
  const { path, video_codec } = unwrap(state);
  let ffmpeg_process = await start_ffmpeg_process(path);
  if (!path) return res.end();
  if (req.url !== "/stream.mkv") {
    return res.end();
  }

  var mime = `video/x-matroska; codecs=${video_codec ? `${video_codec},` : ""}pcm_s16le`;

  console.log(mime);

  res.setHeader("Content-Type", mime);
  //res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Keep-Alive", "timeout=60");

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
  console.info(`Server running at http://${default_state.hostname}:${default_state.port}/`);
});
