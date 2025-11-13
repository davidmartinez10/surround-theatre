import style from "./App.module.css";
import fs from "nwts-tools/lib/node/fs";
import path from "nwts-tools/lib/node/path";
import { state } from "./state";
// import { video, bar, controls, refresh_player } from "./video";

const select = (
  <select value={JSON.stringify(state.virtualizer)}>
    <optgroup label="HRIR">
      {fs.readdirSync("./hrir").filter(function predicate(value) { return path.extname(value) === ".wav"; }).map(function callbackfn(filename) {
        return (
          <option label={filename} value={JSON.stringify({ type: "hrir", filename })}></option>
        );
      })}
    </optgroup>
    <optgroup label="Sofalizer">
      {fs.readdirSync("./sofa").filter(function predicate(value) { return path.extname(value) === ".sofa"; }).map(function callbackfn(filename) {
        return (
          <option label={filename} value={JSON.stringify({ type: "sofa", filename })}></option>
        );
      })}
    </optgroup>
  </select>
) as HTMLSelectElement;

select.onchange = function (event: any) {
  state.virtualizer = JSON.parse(event?.target?.value);
  // refresh_player();
};

function App() {
  return (
    <article>
      <section class="video">
        <img />
        {/* {video} */}
      </section>
      <section class="panel">
        {/* {bar}
        {controls} */}
        {select}
      </section>
      <section>
        <span>

          <a href={`http://${state.hostname}:${state.port}`}>http://{state.hostname}:{state.port}</a>
        </span>
      </section>
    </article>
  );
}

export default App;
