import { load_media_file } from "./util/media_loader";
import { refresh_player } from "./VideoPlayer";

export const file_input = (
  <input
    type="file"
    style={{ display: "none" }}
    // nwdirectory
    onchange={async function (event) {
      console.log(event.target.files);
      if (event.target.files.length > 0) {
        await refresh_player(true);
        load_media_file(event.target.files[0], 0);
      }
    }}
  />
) as HTMLInputElement;
7;
