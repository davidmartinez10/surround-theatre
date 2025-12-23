import { Show, For } from "solid-js";
import { unwrap } from "solid-js/store";

import { default_state, queue, set_state, state } from "./util/db";
import { refresh_player, video } from "./VideoPlayer";
import { dolby_atmos } from "./util/logos";

import fs from "nwts-tools/lib/node/fs";
import path from "nwts-tools/lib/node/path";
import dolbyLogo from "./public/dolbyatmos.svg?raw";
import { ControlChars } from "./util/constants";

function randomhexcolor(): string | undefined {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

const { title } = document;

const marker = (
  <div
    class="marker"
    style={{ width: `${(state.current_position / state.duration) * 100}%` }}
  ></div>
) as HTMLDivElement;
export const bar = (<div class="bar">{marker}</div>) as HTMLDivElement;

bar.onclick = async function (e) {
  const target = e.target as HTMLElement;
  console.error(
    target.getBoundingClientRect().x,
    bar.offsetLeft,
    e.offsetX,
    bar.clientWidth
  );
  const fraction =
    (target.getBoundingClientRect().x - bar.offsetLeft + e.offsetX - 2) /
    bar.clientWidth;
  await set_state({
    current_position:
      Math.round(
        Math.min(Math.max(0, state.duration * fraction), state.duration)
      ) || 0,
  });
  refresh_player();
};

function Controls({ class: className }: { class?: string }) {
  const previous = (
    <x-button disabled={(state?.path || "").length <= 0}>
      {ControlChars.previous}
    </x-button>
  ) as HTMLButtonElement;
  previous.title = "Previous";
  previous.onclick = async function () {
    await set_state({
      current_position:
        unwrap(state)
          .tracks.slice()
          .reverse()
          .find(function predicate(value) {
            return value.start_time < unwrap(state).current_position;
          })?.start_time || 0,
    });
    refresh_player();
  };

  const play = (
    <x-button
      disabled={state.loading || (state?.path || "").length <= 0}
      title={state.playing ? "Pause" : "Play"}
    >
      {state.playing ? ControlChars.pause : ControlChars.play}
    </x-button>
  ) as HTMLButtonElement;

  play.onclick = async function () {
    await set_state({ playing: !unwrap(state).playing });
    if (unwrap(state).playing) {
      video.pause();
    } else {
      if (video.paused) {
        video.play();
      } else {
        refresh_player();
      }
    }
  };

  const next = (
    <x-button disabled={(state?.path || "").length <= 0}>
      {ControlChars.next}
    </x-button>
  ) as HTMLButtonElement;
  next.title = "Next";
  next.onclick = async function () {
    await set_state({
      current_track: (unwrap(state).current_track ?? 0) + 1,
      current_position:
        Math.round(
          unwrap(state).tracks[(unwrap(state).current_track ?? 0) + 1]
            ?.start_time || 0
        ) || 0,
    });
    refresh_player();
  };

  const stop = (<x-button>{ControlChars.stop}</x-button>) as HTMLButtonElement;

  stop.style.margin = "0 0.25rem 0 0.25rem";
  stop.title = "Stop";

  stop.onclick = function () {
    console.log("stop");
    refresh_player(true);
    document.title = title;
  };

  const playback_buttons = (
    <x-box vertical style="align-self: flex-start; gap: 0.25rem;">
      <x-buttons>
        {previous}
        {play}
        {next}
        {stop}
      </x-buttons>
    </x-box>
  );

  function time(seconds: number) {
    const current = new Date(0);
    current.setSeconds(seconds || 0);
    return current.toISOString().substr(11, 8);
  }

  const time_display = (
    <x-box vertical style="align-self: flex-end;">
      <x-button style="min-width: 19ch; white-space: nowrap; place-content: space-evenly;">
        <span>{time(state.current_position)}</span>
        <span>/</span>
        <span>{time(state.duration)}</span>
      </x-button>
    </x-box>
  );

  const binaural_renderer = (
    <x-select
      value={
        state?.binaural_renderer?.filename ||
        default_state?.binaural_renderer?.filename ||
        ""
      }
    >
      <x-menu>
        <x-label>HRIR</x-label>
        <For
          each={fs
            .readdirSync("./hrir")
            .filter(function predicate(value) {
              return path.extname(value) === ".wav";
            })
            .sort()}
        >
          {(filename) => (
            <x-menuitem value={filename}>
              {dolby_atmos}
              <x-label>
                {path.basename(filename, path.extname(filename))}
              </x-label>
            </x-menuitem>
          )}
        </For>
        <x-label>Sofalizer</x-label>
        <For
          each={fs
            .readdirSync("./sofa")
            .filter(function predicate(value) {
              return path.extname(value) === ".sofa";
            })
            .sort()}
        >
          {(filename) => (
            <x-menuitem value={filename}>
              <x-label>
                {path.basename(filename, path.extname(filename))}
              </x-label>
            </x-menuitem>
          )}
        </For>
      </x-menu>
    </x-select>
  ) as HTMLSelectElement;

  binaural_renderer.onchange = async function (event: any) {
    await set_state({
      binaural_renderer: {
        type: path.extname(event?.target?.value) === ".wav" ? "hrir" : "sofa",
        filename: event?.target?.value,
      },
    });
    refresh_player();
  };

  const volume_slider = (
    <x-box
      vertical={false}
      style="justify-content: center; width: -webkit-fill-available; gap: 0.5rem;"
    >
      <x-label
        onclick={function () {
          set_state({ volume: 0 });
          video.volume = 0;
        }}
      >
        {ControlChars.volume_mute}
      </x-label>
      <x-slider
        size="small"
        value={Math.round(state.volume * 100)}
        step={10}
        ticks
        style="width: 10rem;"
        title="Volume"
        onchange={async function (event: any) {
          await set_state({ volume: Number(event?.target?.value) / 100 });
          video.volume = Number(event?.target?.value) / 100;
        }}
      ></x-slider>
      <x-label
        onclick={function () {
          set_state({ volume: 1 });
          video.volume = 1;
        }}
      >
        {ControlChars.volume}
      </x-label>
    </x-box>
  ) as HTMLInputElement;

  return (
    <x-box
      class={className}
      style="width: 100%; height: 100%; padding: 0.5rem; gap: 0.5rem; align-items: center; justify-content: space-between;"
      vertical
    >
      <x-box vertical={false} style="width: 100%;">
        {bar}
      </x-box>

      <x-box
        vertical={false}
        style="justify-content: space-between; width: -webkit-fill-available;"
      >
        {state.path.length > 0 ? playback_buttons : null}
        {volume_slider}
        {state.duration > 0 ? time_display : null}
      </x-box>

      <x-box
        vertical={false}
        style="justify-content: space-between; width: -webkit-fill-available; gap: 0.5rem;"
      >
        {state?.audio_streams?.length > 0 && (
          <x-card style="background-color: rgba(255, 255, 255, 0.1); padding: 0.5rem;">
            <x-label>Audio Stream</x-label>
            <x-select
              value={String(state?.audio_stream)}
              onchange={async function (event: any) {
                await set_state({ audio_stream: Number(event?.target?.value) });
                refresh_player();
              }}
            >
              <x-menu>
                <For each={state?.audio_streams || []}>
                  {function callbackfn(stream) {
                    return (
                      <x-menuitem value={String(stream.index)}>
                        <x-swatch value={randomhexcolor() || "#000000"} />
                        <x-label>
                          <x-label>
                            {stream.codec_name} |{" "}
                            {stream.channel_layout || `${stream.channels}ch`}
                          </x-label>
                          <x-label>
                            {stream.sample_rate}kHz{" "}
                            {stream.bit_rate
                              ? `@${Math.round(stream.bit_rate / 1000)}kbps`
                              : ""}
                          </x-label>
                        </x-label>
                      </x-menuitem>
                    );
                  }}
                </For>
              </x-menu>
            </x-select>
          </x-card>
        )}
        {state?.video_streams?.length > 0 && (
          <x-card style="background-color: rgba(255, 255, 255, 0.1); padding: 0.5rem;">
            <x-label>Video Stream</x-label>
            <x-select
              value={String(state?.video_stream)}
              onchange={async function (event: any) {
                await set_state({ video_stream: Number(event?.target?.value) });
                refresh_player();
              }}
            >
              <x-menu>
                <For each={state?.video_streams || []}>
                  {function callbackfn(stream) {
                    return (
                      <x-menuitem value={String(stream.index)}>
                        <x-swatch value={randomhexcolor() || "#000000"} />
                        <x-label>
                          <x-label>{stream.codec_name}</x-label>
                          <x-label>
                            {`${stream.height}${
                              stream.field_order === "progressive" ? "p" : "i"
                            }`}
                          </x-label>
                        </x-label>
                      </x-menuitem>
                    );
                  }}
                </For>
              </x-menu>
            </x-select>
          </x-card>
        )}
        <x-card style="background-color: rgba(255, 255, 255, 0.1); padding: 0.5rem;">
          <x-label>Binaural Renderer</x-label>
          {binaural_renderer}
        </x-card>
      </x-box>
    </x-box>
  );
}

export default Controls;
