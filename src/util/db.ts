import { PouchDB } from "./pouchdb";
import { use_collection } from "./use_pouchdb_collection";

export const queue_db = new PouchDB<{ track: string, name: string }> ("queue", { adapter: "memory" });
export const [queue] = use_collection(queue_db);

export const chapters_db = new PouchDB<{ chapter: string, name: string, start_time: number, file_path: string }> ("chapters", { adapter: "memory" });
export const [chapters] = use_collection(chapters_db);


