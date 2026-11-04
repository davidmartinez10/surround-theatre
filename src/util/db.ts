import {PouchDB} from "./pouchdb";
import {SingleDocumentCollection, use_collection, use_single_document_collection,} from "./use_pouchdb_collection";

export const queue_db = new PouchDB<{track: string; name: string}>("queue", {
  adapter: "memory",
});
export const [queue]  = use_collection(queue_db);

export const chapters_db = new PouchDB<{
  chapter: string; name: string; start_time: number; file_path: string;
}>("chapters", {adapter: "memory"});
export const [chapters]  = use_collection(chapters_db);

export type MusicTrack = {
  performer?: string|null;
  title?: string; start_time: number;
};

interface AudioStreamInfo {
  index: number;
  codec_name: string;
  codec_long_name: string;
  codec_type:
    "audio"|"video"|"subtitle"|"data"; // Assuming other possible codec types
  codec_tag_string: string;
  codec_tag: string;
  sample_fmt: string;
  sample_rate: string; // Note: this is a string in the JSON
  channels: number;
  channel_layout: string;
  bits_per_sample: number;
  initial_padding: number;
  bit_rate?: number;
  r_frame_rate: string;
  avg_frame_rate: string;
  time_base: string;
  start_pts: number;
  start_time: string;
  bits_per_raw_sample: string;
  extradata_size: number;
  disposition: {
    default: number; dub: number; original: number; comment: number;
    lyrics: number;
    karaoke: number;
    forced: number;
    hearing_impaired: number;
    visual_impaired: number;
    clean_effects: number;
    attached_pic: number;
    timed_thumbnails: number;
    captions: number;
    descriptions: number;
    metadata: number;
    dependent: number;
    still_image: number;
  };
  tags: {
    DURATION: string; ENCODER: string;
    // Add other possible tags as needed
    [key: string]: string | undefined;
  };
}

export type VideoStreamInfo = {
  index: number; codec_name: string; codec_long_name: string; profile: string;
  codec_type: "video";
  codec_tag_string: string;
  codec_tag: string;
  width: number;
  height: number;
  coded_width: number;
  coded_height: number;
  closed_captions: number;
  has_b_frames: number;
  sample_aspect_ratio: string;
  display_aspect_ratio: string;
  pix_fmt: string;
  level: number;
  color_range: string;
  color_space: string;
  color_transfer: string;
  color_primaries: string;
  chroma_location: string;
  field_order: string;
  refs: number;
  is_avc: string;
  nal_length_size: string;
  r_frame_rate: string;
  avg_frame_rate: string;
  time_base: string;
  start_pts: number;
  start_time: string;
  bits_per_raw_sample: string;
  disposition: {
    default: number; dub: number; original: number; comment: number;
    lyrics: number;
    karaoke: number;
    forced: number;
    hearing_impaired: number;
    visual_impaired: number;
    clean_effects: number;
    attached_pic: number;
    timed_thumbnails: number;
    captions: number;
    descriptions: number;
    metadata: number;
    dependent: number;
    still_image: number;
  };
  tags: {
    BPS: string; DURATION: string; NUMBER_OF_BYTES: string;
    NUMBER_OF_FRAMES: string;
    SOURCE_ID: string;
    _STATISTICS_TAGS: string;
    _STATISTICS_WRITING_APP: string;
    _STATISTICS_WRITING_DATE_UTC: string;
  };
};

export type State = {
  audio_codec: string; video_codec: string;
  binaural_renderer:
    {type: "sofa" | "hrir"; filename: `${string}.wav` | `${string}.sofa`;};
  current_track: number;
  current_position: number;
  volume: number;
  tracks: MusicTrack[];
  playing: boolean;
  loading: boolean;
  path: string;
  static_bitmap: string;
  video_stream: number;
  video_streams: VideoStreamInfo[];
  audio_stream: number;
  audio_streams: AudioStreamInfo[];
  reencode_video: boolean;
  duration: number;
  hostname: string;
  port: number;
};

export const default_state: Partial<State> = {
  hostname: "localhost",
  port: 13231,
  binaural_renderer: {
    type: "sofa",
    filename: "D2_48K_24bit_256tap_FIR_SOFA.sofa",
  },
  playing: false,
  volume: 1,
  loading: false,
  path: "",
  current_position: 0,
  current_track: 0,
  duration: 0,
  tracks: [],
  video_codec: "",
  audio_codec: "",
  video_stream: NaN,
  audio_stream: NaN,
  video_streams: [],
  audio_streams: [],
};

export const state_db = new PouchDB<SingleDocumentCollection<State>>("state", {
  adapter: "memory",
});

export const [state, set_state] = use_single_document_collection<State>(
  state_db as PouchDB.Database<SingleDocumentCollection<State>>,
);

type FilePath = string;

export interface LoudnormOutput {
  input_i: string;
  input_tp: string;
  input_lra: string;
  input_thresh: string;
  target_offset: string;
}

export type Meta = {
  _id: FilePath;
  loudnorm: Record<State["binaural_renderer"]["filename"], LoudnormOutput>;
};

export const metadata_db = new PouchDB<Meta>("metadata_db");
