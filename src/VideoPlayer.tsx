import { bar } from "./Controls";
import { queue, set_state, state } from "./util/db";
import { unwrap } from "solid-js/store";

export const video = <video autoplay preload="auto" src={`http://${unwrap(state).hostname}:${unwrap(state).port}/`}></video> as HTMLVideoElement;

let interval: number | NodeJS.Timeout;

video.onplaying = function () {
  clearInterval(interval);
  interval = setInterval(function callback() {
    if (state.current_position > state.duration) {
      return clearInterval(interval);
    }
    set_state({ current_position: state.current_position + 1 });
  }, 1000);
  set_state({ playing: true });
};


video.onended = function () {
  console.log("ended");
  clearInterval(interval);
};
video.onpause = function () {
  console.log("pause");
  clearInterval(interval);
};
video.onstalled = function () {
  console.log("stalled");
  clearInterval(interval);
};


video.onload = function () {
  console.log("loaded");
  video.play();
};

export function refresh_player(just_clear = false) {
  clearInterval(interval);
  for (const el of document.querySelectorAll(".chapter-marker")) {
    el.remove();
  }

  if (just_clear) {
    set_state({ current_position: 0, playing: false, video_codec: "", audio_codec: "", video_stream: NaN, audio_stream: NaN, video_streams: [], audio_streams: [] });

    video.pause();
    video.src = "";
    video.poster = "";
    return;
  }

  if (state?.tracks?.length > 1) {
    for (const [index, chapter] of state.tracks.entries()) {
      const m = <div class="chapter-marker"></div> as HTMLDivElement;
      m.style.position = 'relative';
      m.style.left = `${(chapter.start_time) / state.duration * 100}%`;
      m.style.width = `${((state.tracks[index + 1]?.start_time || state.duration) - chapter.start_time) / state.duration * 100}%`;
      if (chapter.title) { m.title = chapter.title; }
      bar.appendChild(m);
    }
  }

  video.src = encodeURI(`http://${state.hostname}:${state.port}/stream.mkv`);
  video.autoplay = state.playing || true;
  video.load();
  video.play();
  return;
}

function VideoPlayer({ class: className }: { class?: string; }) {
  return (
    <x-box class={className} style="width: -webkit-fill-available; height: -webkit-fill-available; padding: 0.5rem;">
      {video}
    </x-box>
  );
}

export default VideoPlayer;