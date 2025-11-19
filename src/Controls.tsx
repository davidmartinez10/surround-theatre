
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

    const time_display = <x-box vertical style="align-self: flex-end"><x-button>00:00 / 00:00</x-button></x-box>;

    return (
        <x-box class={className} style="width: 100%; height: 100%; padding: 0.5rem; align-items: center; justify-content: flex-start;" vertical>
            <x-box vertical={false} style="justify-content: space-between; width: -webkit-fill-available; margin-bottom: 1rem;">
                {playback_buttons}
                {time_display}
            </x-box>
            <x-box vertical={false} style="justify-content: space-between; width: -webkit-fill-available; gap: 0.5rem;">
                <x-card style="background-color: rgba(255, 255, 255, 0.1); padding: 0.5rem;">
                    <x-label>Audio Codec</x-label>
                    <x-select></x-select>
                </x-card>
                <x-card style="background-color: rgba(255, 255, 255, 0.1); padding: 0.5rem;">
                    <x-label>Video Codec</x-label>
                    <x-select></x-select>
                </x-card>
                <x-card style="background-color: rgba(255, 255, 255, 0.1); padding: 0.5rem;">
                    <x-label>Virtualizer</x-label>
                    <x-select>
                        <x-menu>
                            <x-menuitem value="car">
                                <x-icon href="#vehicle-car"></x-icon>
                                <x-label>Car</x-label>
                            </x-menuitem>

                            <x-menuitem value="bicycle">
                                <x-icon href="#vehicle-bicycle"></x-icon>
                                <x-label>Bicycle</x-label>
                            </x-menuitem>
                        </x-menu>
                    </x-select>
                </x-card>
            </x-box>
        </x-box>
    );
}

export default Controls;