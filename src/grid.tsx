import style from "./App.module.css";
import Chapters from "./Chapters";
import MediaInfo from "./MediaInfo";
import Queue from "./Queue";
import VideoPlayer from "./VideoPlayer";

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
