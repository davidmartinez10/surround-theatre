import { Show, For } from "solid-js";

import { queue, set_state, state } from "./util/db";
import { unwrap } from "solid-js/store";

import fs from "nwts-tools/lib/node/fs";
import path from "nwts-tools/lib/node/path";
import { refresh_player } from "./VideoPlayer";

const control_chars = ['▶', '⏸', '⏯', '⏮', '⏭', '⏹', '⏺', '⏏', 'ℹ', '🔊'] as const;

function Controls({ class: className }: { class?: string }) {
    const playback_buttons = (
        <x-box vertical style="align-self: flex-start">
            <x-buttons>
                <x-button>⏮</x-button>
                <x-button>⏯</x-button>
                <x-button>⏭</x-button>
                <x-button>⏹</x-button>
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

    const select = (
        <x-select value={JSON.stringify(state.virtualizer)}>
            <x-menu>
                <x-label>HRIR</x-label>
                <For each={fs.readdirSync("./hrir").filter(function predicate(value) { return path.extname(value) === ".wav"; })}>
                    {(filename) => (
                        <x-menuitem value={JSON.stringify({ type: "hrir", filename })}><x-label>{path.basename(filename, path.extname(filename))}</x-label></x-menuitem>
                    )}
                </For>
                <x-label>Sofalizer</x-label>
                <For each={fs.readdirSync("./sofa").filter(function predicate(value) { return path.extname(value) === ".sofa"; })}>
                    {(filename) => (
                        <x-menuitem value={JSON.stringify({ type: "sofa", filename })}><x-label>{path.basename(filename, path.extname(filename))}</x-label></x-menuitem>
                    )}
                </For>
            </x-menu>
        </x-select>
    ) as HTMLSelectElement;

    select.onchange = function (event: any) {
        set_state({ virtualizer: JSON.parse(event?.target?.value) });
        refresh_player();
    };


    return (
        <x-box class={className} style="width: 100%; height: 100%; padding: 0.5rem; align-items: center; justify-content: flex-start;" vertical>
            { /* Playback Controls */}
            <x-box vertical={false} style="width: 100%; margin: 0.5rem 0;">
                <x-slider min="0" max="100" value={state.current_position / state.duration * 100}></x-slider>
            </x-box>

            <x-box vertical={false} style="justify-content: space-between; width: -webkit-fill-available; margin-bottom: 1rem;">
                {playback_buttons}
                {time_display}
            </x-box>
            <x-box vertical={false} style="justify-content: space-between; width: 90vw; gap: 0.5rem;">
                {state?.audio_streams?.length > 0 && <x-card style="background-color: rgba(255, 255, 255, 0.1); padding: 0.5rem;">
                    <x-label>Audio Codec</x-label>
                    <x-select value={state?.audio_streams?.[state?.audio_stream]?.codec_name || ''}>
                        <x-menu>
                            <For each={state?.audio_streams || []}>
                                {(stream) => (
                                    <x-menuitem value={stream.codec_name}>
                                        <x-label>{[stream.codec_name,stream.channel_layout,stream.sample_rate].join(' - ')}</x-label>
                                    </x-menuitem>
                                )}
                            </For>
                        </x-menu>
                    </x-select>
                </x-card>}
                {state?.video_streams?.length > 0 && <x-card style="background-color: rgba(255, 255, 255, 0.1); padding: 0.5rem;">
                    <x-label>Video Codec</x-label>
                    <x-select value={state?.video_streams?.[state?.video_stream]?.codec_name || ''}>
                        <x-menu>
                            <For each={state?.video_streams || []}>
                                {(stream) => (
                                    <x-menuitem value={stream.codec_name}>
                                        <x-label>{stream.codec_name || ''}</x-label>
                                    </x-menuitem>
                                )}
                            </For>
                        </x-menu>
                    </x-select>
                </x-card>}
                <x-card style="background-color: rgba(255, 255, 255, 0.1); padding: 0.5rem;">
                    <x-label>Virtualizer</x-label>
                    {select}
                </x-card>
            </x-box>
        </x-box>
    );
}

export default Controls;