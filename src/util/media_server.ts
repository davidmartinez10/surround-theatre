import http from "nwts-tools/lib/node/http";
import os from "nwts-tools/lib/node/os";

import {default_state, set_state, state} from "./db";
import {start_ffmpeg_process} from "./ffmpeg";
import {proper_exec} from "./proper_spawn";

set_state({...default_state });

const server = http.createServer(async function media_server(req, res) {
  const { path, video_codec } = state;
  let ffmpeg_process          = await start_ffmpeg_process(path);
  if (! path) return res.end();
  if (req.url !== "/stream.mkv") { return res.end(); }

  var mime = `video/x-matroska; codecs=${
    video_codec.includes("264") || video_codec.includes("avc1") ? "avc1.64001E,"
    : video_codec ? `${video_codec},`
                  : ""}pcm_s16le`;
  console.log(mime, "supported:", MediaSource.isTypeSupported(mime));
  if (video_codec) {
    console.log(
      video_codec,
      "video codec supported: ",
      MediaSource.isTypeSupported(
        mime.replace("x-matroska", "mp4").replace(",pcm_s16le", ""),
        ),
    );
  }

  res.setHeader("Content-Type", mime);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Keep-Alive", "timeout=60");

  ffmpeg_process.stdout?.pipe(res);

  function close() {
    ffmpeg_process?.stdin?.destroy();
    ffmpeg_process?.stdout?.destroy();
    ffmpeg_process?.stderr?.destroy();
    ffmpeg_process.kill();
    process.kill(-ffmpeg_process.pid!, "SIGKILL");
    if (os.platform() === "win32") {
      proper_exec(`taskkill /pid ${ffmpeg_process.pid} /T /F`);
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
  console.info(
    `Server running at http://${default_state.hostname}:${default_state.port}/`,
  );
});
