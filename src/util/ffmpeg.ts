import { escape_path, proper_spawn } from "nwts-tools/dist/lib/proper-spawn";

export const ffmpeg = nw.require("ffmpeg-static") as string;
export const ffprobe = nw.require("@ffprobe-installer/ffprobe").path as string;

export async function get_metadata(filename: string) {
    const result = await proper_spawn(
        `${escape_path(ffprobe)} -of json -show_chapters -show_format -show_entries stream -hide_banner -i ${escape_path(filename)}`
    );
    return JSON.parse(result as unknown as string) as any;
}