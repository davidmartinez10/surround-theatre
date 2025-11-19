
function Controls({ class: className }: { class?: string }) {
    const playback_buttons = (
        <x-card>
            <x-buttons>
                <x-button>▶</x-button>
                <x-button>⏸</x-button>
                <x-button>⏯</x-button>
                <x-button>⏮</x-button>
                <x-button>⏭</x-button>
                <x-button>⏹</x-button>
                <x-button>⏺</x-button>
                <x-button>⏏</x-button>
                <x-button>ℹ</x-button>
                <x-button>🔊</x-button>
            </x-buttons>
        </x-card>
    );

    const time_display = <x-label>00:00 / 00:00</x-label>;

    return (
        <x-box class={className} vertical>
            <x-box style="justify-content: space-between; align-items: center;">
                {playback_buttons}
                {time_display}
            </x-box>
            <x-box>
                <x-box vertical>
                    <x-label>Audio Codec</x-label>
                </x-box>
                <x-box vertical>
                    <x-label>Video Codec</x-label>
                </x-box>
                <x-box vertical>
                    <x-label>Virtualizer</x-label>
                </x-box>
            </x-box>
        </x-box>
    );
}

export default Controls;