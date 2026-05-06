import { bar } from "./Controls";
import { ControlChars } from "./util/constants";
import { set_state, state } from "./util/db";

export const video = (
  <video
    autoplay
    preload="auto"
    src={`http://${state.hostname}:${state.port}/`}
  ></video>
) as HTMLVideoElement;

video.addEventListener("dblclick", function () {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    video.requestFullscreen();
  }
});

var interval: number | NodeJS.Timeout;

video.onplaying = function () {
  console.log("playing");
  clearInterval(interval);
  interval = setInterval(function callback() {
    if (state.current_position > state.duration) {
      return clearInterval(interval);
    }
    set_state({ current_position: state.current_position + 1 });
  }, 1000);
  set_state({ playing: true, loading: false });
  document.title = `${ControlChars.play} ${state.path.split("/").pop()}`;
};

video.onvolumechange = function () {
  console.log("volume change");
  set_state({ volume: video.volume });
};

video.onended = function () {
  console.log("ended");
  set_state({ current_position: 0 });
  set_state({ loading: false, playing: false });
  clearInterval(interval);
  document.title = `${ControlChars.stop} ${state.path.split("/").pop()}`;
};
video.onwaiting = function () {
  console.log("waiting");
  clearInterval(interval);
  set_state({ loading: true });
  document.title = `${ControlChars.waiting} ${state.path.split("/").pop()}`;
};

video.onerror = function (e) {
  console.log("error", e);
  clearInterval(interval);
  set_state({ loading: false, playing: false });
  if (state.path.length > 0) {
    document.title = `${ControlChars.error} ${state.path.split("/").pop()}`;
  }
};

video.onpause = function () {
  console.log("pause");
  clearInterval(interval);
  set_state({ loading: false, playing: false });
  document.title = `${ControlChars.pause} ${state.path.split("/").pop()}`;
};

video.onstalled = function () {
  console.log("stalled");
  clearInterval(interval);
  set_state({ loading: true });
  document.title = `${ControlChars.waiting} ${state.path.split("/").pop()}`;
};

video.onplay = video.onplaying;

video.onseeking = function () {
  console.log("seeking");
  clearInterval(interval);
  set_state({ loading: true, playing: false });
};

video.onseeked = function () {
  console.log("seeked");
  clearInterval(interval);
  set_state({ loading: false, playing: true });
};

export async function refresh_player(just_clear = false) {
  if (just_clear) {
    clearInterval(interval);
    for (const el of document.querySelectorAll(".chapter-marker")) {
      el.remove();
    }
    await set_state({
      path: "",
      current_position: 0,
      current_track: 0,
      duration: 0,
      tracks: [],
      loading: false,
      playing: false,
      video_codec: "",
      audio_codec: "",
      video_stream: NaN,
      audio_stream: NaN,
      video_streams: [],
      audio_streams: [],
    });
    video.pause();
    video.src = "";
    video.poster = "";

    return;
  }

  video.src = encodeURI(`http://${state.hostname}:${state.port}/stream.mkv`);
  set_state({ loading: true });
  video.autoplay = state.playing || true;

  if (state.tracks?.length > 1) {
    for (const [index, chapter] of state.tracks.entries()) {
      const m = (<div class="chapter-marker"></div>) as HTMLDivElement;
      m.style.position = "relative";
      m.style.left = `${(chapter.start_time / state.duration) * 100}%`;
      m.style.width = `${
        (((state.tracks[index + 1]?.start_time || state.duration) -
          chapter.start_time) /
          state.duration) *
        100
      }%`;
      if (chapter.title) {
        m.title = chapter.title;
      }
      bar.appendChild(m);
    }
  }
  return;
}

function VideoPlayer({ class: className }: { class?: string }) {
  return (
    <x-box
      class={className}
      style="width: -webkit-fill-available; height: -webkit-fill-available; padding: 0.5rem; position: relative;"
    >
      {video}
      {state.loading ? (
        <x-throbber style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 999999;"></x-throbber>
      ) : null}
    </x-box>
  );
}

export default VideoPlayer;
