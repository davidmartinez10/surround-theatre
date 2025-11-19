import style from "./App.module.css";
import Controls from "./Controls";
import VideoPlayer from "./VideoPlayer";

function App() {
  return (
    <x-box class={style.app} vertical>
      <x-box class={style.grid}>
        <x-card class={style.cell}>
          <VideoPlayer class={style.sectioAureaLong} />
        </x-card>
        <x-card class={style.cell}>
          <Controls class={style.sectioAureaShort} />
        </x-card>
      </x-box>
    </x-box>
  );
}

export default App;
