import path from "nwts-tools/lib/node/path";
import { get_metadata } from "./ffmpeg";
import {state} from "./db";
import { unwrap } from "solid-js/store";

enum Channel {
  FL  = "FL",
  FR  = "FR",
  FC  = "FC",
  LFE = "LFE",
  BL  = "BL",
  BR  = "BR",
  SL  = "SL",
  SR  = "SR",
}

const channels = Object.values(Channel);

export async function filter_complex(audio_stream: number|"a", loudnorm?: string) {
  if ((await get_metadata(path.join(".", "hrir", unwrap(state).virtualizer.filename))).streams[0].channels < 8) {
    const pan = [
      "pan=16c",
      "c0=c0",
      "c1=c1",
      "c2=c1",
      "c3=c0",
      "c4=c6",
      "c5=c6",
      "c6=c6",
      "c7=c6",
      "c8=c4",
      "c9=c5",
      "c10=c5",
      "c11=c4",
      "c12=c2",
      "c13=c3",
      "c14=c3",
      "c15=c2",
    ];

    const filter
      = `[1:0]${pan.join("|")}[hrirs];[0:${audio_stream}][hrirs]headphone=map=${
        channels.join(
          "|")}:hrir=multich${loudnorm ? `,loudnorm=${loudnorm}` : ""}[hf]`;

    return `-filter_complex "${filter}" -map "[hf]:${audio_stream}"`;
  } else {
    const pan = [
      "pan=16c",
      "c0=c0",
      "c1=c1",
      "c2=c8",
      "c3=c7",
      "c4=c6",
      "c5=c13",
      "c6=c6",
      "c7=c13",
      "c8=c4",
      "c9=c5",
      "c10=c12",
      "c11=c11",
      "c12=c2",
      "c13=c3",
      "c14=c10",
      "c15=c9",
    ];

    const filter
      = `[1:0]${pan.join("|")}[hrirs];[0:${audio_stream}][hrirs]headphone=map=${
        channels.join(
          "|")}:hrir=multich${loudnorm ? `,loudnorm=${loudnorm}` : ""}[hf]`;

    return `-filter_complex "${filter}" -map "[hf]:${audio_stream}"`;
  }
}
