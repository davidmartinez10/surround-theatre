interface MusicTrack {
  performer?: string|null;
  title?: string|null;
  start_time: number;
}

export interface State {
  file: string;
  seconds: number;
  duration: number;
  tracks: MusicTrack[];
  audio_stream?: number;
  video_stream?: number;
  reencode_video?: boolean;
  static_bitmap?: Uint8Array;
  hostname: string;
  port: number;
  virtualizer: { type: "sofa" | "hrir" , filename:`${string}.wav` | `${string}.sofa`};
}

export const default_state: State = Object.freeze({
  file: "",
  seconds: 0,
  duration: 0,
  tracks: [] as MusicTrack[],
  audio_stream: undefined,
  video_stream: undefined,
  reencode_video: false,
  static_bitmap: undefined,
  hostname: "localhost",
  port: 13231,
  virtualizer: { type: "sofa", filename: "ClubFritz11.sofa" } as const
});

export let state: State = Object.assign({}, default_state);
