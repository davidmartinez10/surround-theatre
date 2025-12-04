import { unwrap } from "solid-js/store";
import { PouchDB } from "./pouchdb";
import { SingleDocumentCollection, use_collection, use_single_document_collection } from "./use_pouchdb_collection";

export const queue_db = new PouchDB<{ track: string, name: string }>("queue", { adapter: "memory" });
export const [queue] = use_collection(queue_db);

export const chapters_db = new PouchDB<{ chapter: string, name: string, start_time: number, file_path: string }>("chapters", { adapter: "memory" });
export const [chapters] = use_collection(chapters_db);

export type State = {
    audio_codec: string;
    video_codec: string;
    virtualizer: { type: "sofa" | "hrir", filename: `${string}.wav` | `${string}.sofa` };
    current_track: number;
    current_duration: number;
    current_position: number;
    path: string;
    static_bitmap: string;
    video_stream: number;
    video_streams: { codec_name: string, index: number, width: number, height: number }[];
    audio_stream: number;
    audio_streams: { codec_name: string, index: number, channels: number }[];
    reencode_video: boolean;
    duration: number;
    hostname: string;
    port: number;
}

export const state_db = new PouchDB<SingleDocumentCollection<State>>("state", { adapter: "memory" });
export const [state, set_state] = use_single_document_collection<State>(state_db as PouchDB.Database<SingleDocumentCollection<State>>);


(globalThis as any).state = () => unwrap(state);
(globalThis as any).audio_streams = () => unwrap(state).audio_streams;
(globalThis as any).video_streams = () => unwrap(state).video_streams;



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
  loudnorm: Record<State["virtualizer"]["filename"], LoudnormOutput>;
};

export const metadata_db = new PouchDB<Meta>("metadata_db");
