import path from "nwts-tools/lib/node/path";
import {unwrap} from "solid-js/store";

import {state} from "./db";
import {get_metadata} from "./ffmpeg";

const pan_map = {
  8: [
    "[1:0]pan=stereo|c0=c0|c1=c1[fl];",
    "[1:0]pan=stereo|c0=c8|c1=c7[fr];",
    "[1:0]pan=stereo|c0=c6|c1=c13[fc];",
    "[1:0]pan=stereo|c0=c6|c1=c13[lfe];",
    "[1:0]pan=stereo|c0=c4|c1=c5[bl];",
    "[1:0]pan=stereo|c0=c12|c1=c11[br];",
    "[1:0]pan=stereo|c0=c2|c1=c3[sl];",
    "[1:0]pan=stereo|c0=c10|c1=c9[sr];",
    "[0:a][fl][fr][fc][lfe][bl][br][sl][sr]",
    "headphone=map=FL|FR|FC|LFE|BL|BR|SL|SR",
  ].join(""),
  6: [
    "[1:0]pan=stereo|c0=c0|c1=c1[fl];",
    "[1:0]pan=stereo|c0=c8|c1=c7[fr];",
    "[1:0]pan=stereo|c0=c6|c1=c13[fc];",
    "[1:0]pan=stereo|c0=c6|c1=c13[lfe];",
    // "[1:0]pan=stereo|c0=c4|c1=c5[bl];",
    // "[1:0]pan=stereo|c0=c12|c1=c11[br];",
    "[1:0]pan=stereo|c0=c2|c1=c3[sl];",
    "[1:0]pan=stereo|c0=c10|c1=c9[sr];",
    "[0:a][fl][fr][fc][lfe][sl][sr]",
    "headphone=map=FL|FR|FC|LFE|SL|SR",
  ].join(""),
  4: [
    "[1:0]pan=stereo|c0=c0|c1=c1[fl];",
    "[1:0]pan=stereo|c0=c8|c1=c7[fr];",
    // "[1:0]pan=stereo|c0=c6|c1=c13[fc];",
    //  "[1:0]pan=stereo|c0=c6|c1=c13[lfe];",
    "[1:0]pan=stereo|c0=c4|c1=c5[bl];",
    "[1:0]pan=stereo|c0=c12|c1=c11[br];",
    // "[1:0]pan=stereo|c0=c2|c1=c3[sl];",
    // "[1:0]pan=stereo|c0=c10|c1=c9[sr];"
    "[0:a][fl][fr][bl][br]",
    "headphone=map=FL|FR|BL|BR",
  ].join(""),
} as const;


const limited_pan_map = {
  4: [
    "[1:0]pan=stereo|c0=c0|c1=c1[fl];",
    "[1:0]pan=stereo|c0=c1|c1=c0[fr];",
    "[1:0]pan=stereo|c0=c4|c1=c5[bl];",
    "[1:0]pan=stereo|c0=c5|c1=c4[br];",
    "[0:a][fl][fr][bl][br]",
    "headphone=map=FL|FR|BL|BR",
  ].join(""),
  6: [
    "[1:0]pan=stereo|c0=c0|c1=c1[fl];",
    "[1:0]pan=stereo|c0=c8|c1=c7[fr];",
    "[1:0]pan=stereo|c0=c6|c1=c6[fc];",
    "[1:0]pan=stereo|c0=c6|c1=c6[lfe];",
    "[1:0]pan=stereo|c0=c4|c1=c5[bl];",
    "[1:0]pan=stereo|c0=c5|c1=c4[br];",
    "[0:a][fl][fr][fc][lfe][bl][br]",
    "headphone=map=FL|FR|FC|LFE|BL|BR",
  ].join(""),
  8: [
    "[1:0]pan=stereo|c0=c0|c1=c1[fl];",
    "[1:0]pan=stereo|c0=c1|c1=c0[fr];",
    "[1:0]pan=stereo|c0=c6|c1=c6[fc];",
    "[1:0]pan=stereo|c0=c6|c1=c6[lfe];",
    "[1:0]pan=stereo|c0=c4|c1=c5[bl];",
    "[1:0]pan=stereo|c0=c5|c1=c4[br];",
    "[1:0]pan=stereo|c0=c2|c1=c3[sl];",
    "[1:0]pan=stereo|c0=c5|c1=c4[sr];",
    "[0:a][fl][fr][fc][lfe][bl][br][sl][sr]",
    "headphone=map=FL|FR|FC|LFE|BL|BR|SL|SR",
  ].join(""),
} as const;

export async function filter_complex(loudnorm?: string) {
  const { audio_stream, binaural_renderer, audio_streams } = unwrap(state);
  const { channels } = audio_streams[audio_stream || 0] || { channels: 0 };

  const hrir_metadata = await get_metadata(
    path.join(process.cwd(), "hrir", binaural_renderer.filename))

  console.log("hrir_metadata", hrir_metadata);
  const hrir_channels = hrir_metadata?.streams?.[0]?.channels;
  console.log(hrir_channels, channels);

  const filter = [
    hrir_channels < channels / 2 || hrir_channels < 8
      ? (limited_pan_map[channels as keyof typeof limited_pan_map]
         || limited_pan_map[8])
      : (pan_map[channels as keyof typeof pan_map] || pan_map[8]),
    loudnorm && `,loudnorm=${loudnorm}`, "[fh]"
  ].join("");

  return `-filter_complex "${filter}" -map "[fh]:${audio_stream}"`;
}
