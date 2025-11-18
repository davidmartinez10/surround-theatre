import style from "./App.module.css";
import Queue from "./Queue";
import Chapters from "./Chapters";
import VideoPlayer from "./VideoPlayer";
import MediaInfo from "./MediaInfo";

function App() {
  return (
    <x-box class={style.app}>
      <x-box class={style.grid}>
        <x-card class={style.cell}>
          <Queue />
        </x-card>
        <x-card class={style.cell}>
          <Chapters />
        </x-card>
        <x-card class={style.cell}>
          <VideoPlayer />
        </x-card>
        <x-card class={style.cell}>
          <MediaInfo />
        </x-card>
      </x-box>
    </x-box>
  );
}

export default App;
