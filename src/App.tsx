import style from "./App.module.css";
import Controls from "./Controls";
import { file_input } from "./file_input";
import VideoPlayer from "./VideoPlayer";

function App() {
  return (
    <x-box class={style.app} vertical>
      <x-box class={style.grid}>
        <x-card class={style.cell}>
          <VideoPlayer />
        </x-card>
        <x-card class={style.cell}>
          <Controls />
        </x-card>
      </x-box>
      {file_input}
    </x-box>
  );
}

export default App;
