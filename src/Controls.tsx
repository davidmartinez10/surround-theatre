import { Show, For } from "solid-js";

import { default_state, queue, set_state, state } from "./util/db";
import { unwrap } from "solid-js/store";

import fs from "nwts-tools/lib/node/fs";
import path from "nwts-tools/lib/node/path";
import { refresh_player, video } from "./VideoPlayer";

const control_chars = ['▶', '⏸', '⏯', '⏮', '⏭', '⏹', '⏺', '⏏', 'ℹ', '🔊'] as const;

const marker = <div class="marker" style={{ width: `${state.current_position / state.duration * 100}%` }}></div> as HTMLDivElement;
export const bar = <div class="bar">{marker}</div> as HTMLDivElement;

bar.onclick = function (e) {
    const target = e.target as HTMLElement;
    console.error(target.getBoundingClientRect().x, bar.offsetLeft, e.offsetX, bar.clientWidth);
    const fraction = (target.getBoundingClientRect().x - bar.offsetLeft + e.offsetX - 2) / bar.clientWidth;
    set_state({ current_position: Math.min(Math.max(0, state.duration * fraction), state.duration) });
    refresh_player();
}

function Controls({ class: className }: { class?: string }) {
    const previous = <x-button>⏮</x-button> as HTMLButtonElement;
    previous.onclick = function () {
        set_state({
            current_position: state.tracks.slice().reverse().find(function predicate(value) {
                return value.start_time < state.current_position;
            })?.start_time || 0
        });
        refresh_player();
    }

    const play = <x-button>{state.playing ? '⏸' : '▶'}</x-button> as HTMLButtonElement;
    play.onclick = function () {
        set_state({ playing: !state.playing });
        refresh_player();
    }

    const next = <x-button>⏭</x-button> as HTMLButtonElement;

    next.onclick = function () {
        set_state({
            current_position: state.tracks.find(function predicate(value) {
                return value.start_time > state.current_position;
            })?.start_time || state.current_position
        });
        refresh_player();
    }
    const playback_buttons = (
        <x-box vertical style="align-self: flex-start">
            <x-buttons>
                {previous}
                {play}
                {next}
            </x-buttons>
        </x-box>
    );

    function time() {
        const current = new Date(0);
        current.setSeconds(state.current_position || 0);

        const total = new Date(0);
        total.setSeconds(state.duration || 0);
        return `${current.toISOString().substr(11, 8)} / ${total.toISOString().substr(11, 8)}`;
    }

    const time_display = <x-box vertical style="align-self: flex-end"><x-button>{time()}</x-button></x-box>;

    const virtualizer = (
        <x-select value={state?.virtualizer?.filename || default_state?.virtualizer?.filename || ""}>
            <x-menu>
                <x-label>HRIR</x-label>
                <For each={fs.readdirSync("./hrir").filter(function predicate(value) { return path.extname(value) === ".wav"; })}>
                    {(filename) => (
                        <x-menuitem value={filename}><x-label>{path.basename(filename, path.extname(filename))}</x-label></x-menuitem>
                    )}
                </For>
                <x-label>Sofalizer</x-label>
                <For each={fs.readdirSync("./sofa").filter(function predicate(value) { return path.extname(value) === ".sofa"; })}>
                    {(filename) => (
                        <x-menuitem value={filename}><x-label>{path.basename(filename, path.extname(filename))}</x-label></x-menuitem>
                    )}
                </For>
            </x-menu>
        </x-select>
    ) as HTMLSelectElement;

    virtualizer.onchange = function (event: any) {
        set_state({ virtualizer: { type: path.extname(event?.target?.value) === ".wav" ? "hrir" : "sofa", filename: event?.target?.value } });
        refresh_player();
    };

    return (
        <x-box class={className} style="width: 100%; height: 100%; padding: 0.5rem; gap: 0.5rem; align-items: center; justify-content: space-between;" vertical>

            <x-box vertical={false} style="width: 100%;">
                {bar}
            </x-box>

            <x-box vertical={false} style="justify-content: space-between; width: -webkit-fill-available;">
                {playback_buttons}
                {time_display}
            </x-box>

            <x-box vertical={false} style="justify-content: space-between; width: -webkit-fill-available; gap: 0.5rem;">
                {state?.audio_streams?.length > 0 && <x-card style="background-color: rgba(255, 255, 255, 0.1); padding: 0.5rem;">
                    <x-label>Audio Codec</x-label>
                    <x-select value={String(state?.audio_stream)} onchange={function (event: any) {
                        set_state({ audio_stream: Number(event?.target?.value) });
                        refresh_player();
                    }}>
                        <x-menu>
                            <For each={state?.audio_streams || []}>
                                {function callbackfn(stream) {
                                    return (
                                        <x-menuitem value={String(stream.index)}>
                                            <x-label>{[stream.codec_name, stream.channel_layout, stream.sample_rate].join(' - ')}</x-label>
                                        </x-menuitem>
                                    );
                                }}
                            </For>
                        </x-menu>
                    </x-select>
                </x-card>}
                {state?.video_streams?.length > 0 && <x-card style="background-color: rgba(255, 255, 255, 0.1); padding: 0.5rem;">
                    <x-label>Video Codec</x-label>
                    <x-select value={String(state?.video_stream)} onchange={function (event: any) {
                        set_state({ video_stream: Number(event?.target?.value) });
                        refresh_player();
                    }}>
                        <x-menu>
                            <For each={state?.video_streams || []}>
                                {function callbackfn(stream) {
                                    return (
                                        <x-menuitem value={String(stream.index)}>
                                            <x-label>{stream.codec_name || ''}</x-label>
                                        </x-menuitem>
                                    );
                                }}
                            </For>
                        </x-menu>
                    </x-select>
                </x-card>}
                <x-card style="background-color: rgba(255, 255, 255, 0.1); padding: 0.5rem;">
                    <x-label>Virtualizer</x-label>
                    {virtualizer}
                </x-card>
            </x-box>

        </x-box>
    );
}

export default Controls;