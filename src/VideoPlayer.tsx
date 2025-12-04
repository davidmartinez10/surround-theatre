import { queue, set_state, state } from "./util/db";
import { unwrap } from "solid-js/store";
import { loudnorm_first_pass } from "./util/ffmpeg";

export const video = <video controls autoplay preload="auto" src={`http://${unwrap(state).hostname}:${unwrap(state).port}/`}></video>as HTMLVideoElement;


let interval: number | NodeJS.Timeout;

video.onplaying = function () {
  clearInterval(interval);
  interval = setInterval(function callback() {
    if (state.current_position > state.duration) {
      return clearInterval(interval);
    }
    set_state({ current_position: state.current_position + 1 });
  }, 1000);
};

export function refresh_player(just_clear = false) {
  clearInterval(interval);
  for (const el of document.querySelectorAll(".chapter-marker")) {
    el.remove();
  }

  if (just_clear) {
    video.pause();
    video.src = "";
    return;
  }

  // if (state.tracks.length > 1) {
  //   for (const chapter of state.tracks) {
  //     const m = <div class="chapter-marker"></div> as HTMLDivElement;
  //     m.style.width = `${(chapter.start_time / state.duration) * 100}%`;
  //     if (chapter.title) m.title = chapter.title;
  //     bar.appendChild(m);
  //   }
  // }
  video.src = "";
  video.src = encodeURI(`http://${unwrap(state).hostname}:${unwrap(state).port}/stream.mkv`);
  video.load();
  video.play();
  video.autoplay = true;
}

function VideoPlayer({ class: className }: { class?: string }) {
  return (
    <x-box class={className} style="width: -webkit-fill-available; height: -webkit-fill-available; padding: 0.5rem;">
      {video}
    </x-box>
  );
}

export default VideoPlayer;