export const colors = [
  "#FF3B30", // Red
  "#FF9500", // Orange
  "#FFCC00", // Yellow
  "#34C759", // Green
  "#007AFF", // Blue
  "#5856D6", // Violet
  "#FF2D55", // Magenta
] as const;

export const SupportedVideoCodecs = [
  "h264",
  "vp8",
  "vp9",
  "hevc",
  "mjpeg",
  "mpeg2video",
  "mpeg4",
  "h263",
] as const;

export const SupportedImageExtensions = [".jpeg", ".jpg", ".png"] as const;

export const ControlChars = {
  volume: "🔊",
  video: "🎥",
  audio: "🎧",
  music: "🎵",
  song: "🎶",
  play: "▶",
  pause: "⏸",
  play_pause: "⏯",
  stop: "⏹",
  next: "⏭",
  previous: "⏮",
  info: `ℹ`,
  eject: `⏏`,
  error: "❌",
  waiting: "⏳",
  volume_mute: "🔇",
} as const;
