import { Innertube } from "youtubei.js";

let client: Innertube | null = null;

async function getClient(): Promise<Innertube> {
  if (!client) {
    client = await Innertube.create({
      lang: "en",
      location: "US",
      retrieve_player: true,
    });
  }
  return client;
}

export type VideoResult = {
  id: string;
  title: string;
  description: string;
  channel: { id: string; name: string; url: string };
  duration: number;
  viewCount: number;
  publishedAt: string | null;
  thumbnails: { url: string; width?: number; height?: number }[];
  tags: string[];
  category: string | null;
  isLive: boolean;
};

export type SearchResult = {
  videos: VideoResult[];
  totalResults: number;
};

function parseDuration(text?: string): number {
  if (!text) return 0;
  const parts = text.split(":").map(Number);
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? 0;
}

function mapVideoBasic(item: unknown): VideoResult {
  const v = item as {
    id?: string;
    title?: { text?: string };
    description?: { text?: string };
    author?: { id?: string; name?: string; url?: string };
    duration?: { seconds?: number; text?: string };
    view_count?: { text?: string };
    published?: { text?: string };
    thumbnails?: { url: string; width?: number; height?: number }[];
    is_live?: boolean;
    category?: string;
    tags?: string[];
  };
  const viewText = v.view_count?.text?.replace(/[^0-9.KMB]/gi, "") ?? "0";
  let viewCount = 0;
  if (viewText.includes("K")) viewCount = parseFloat(viewText) * 1000;
  else if (viewText.includes("M")) viewCount = parseFloat(viewText) * 1_000_000;
  else if (viewText.includes("B")) viewCount = parseFloat(viewText) * 1_000_000_000;
  else viewCount = parseInt(viewText.replace(/\D/g, ""), 10) || 0;

  return {
    id: v.id ?? "",
    title: v.title?.text ?? "",
    description: v.description?.text ?? "",
    channel: {
      id: v.author?.id ?? "",
      name: v.author?.name ?? "",
      url: v.author?.url ?? "",
    },
    duration: v.duration?.seconds ?? parseDuration(v.duration?.text),
    viewCount,
    publishedAt: v.published?.text ?? null,
    thumbnails: v.thumbnails ?? [],
    tags: v.tags ?? [],
    category: v.category ?? null,
    isLive: v.is_live ?? false,
  };
}

export async function searchVideos(query: string, limit = 10): Promise<SearchResult> {
  const yt = await getClient();
  const results = await yt.search(query, { type: "video" });
  const videos = results.videos?.slice(0, limit).map((v) => mapVideoBasic(v)) ?? [];
  return { videos, totalResults: videos.length };
}

export async function getVideoInfo(videoId: string): Promise<VideoResult | null> {
  const yt = await getClient();
  try {
    const info = await yt.getInfo(videoId);
    const details = info.basic_info;
    return {
      id: details.id ?? videoId,
      title: details.title ?? "",
      description: details.short_description ?? "",
      channel: {
        id: details.channel_id ?? "",
        name: details.author ?? "",
        url: `https://www.youtube.com/channel/${details.channel_id ?? ""}`,
      },
      duration: details.duration ?? 0,
      viewCount: details.view_count ?? 0,
      publishedAt: details.start_timestamp?.toISOString() ?? null,
      thumbnails: (details.thumbnail ?? []).map((t) => ({
        url: t.url,
        width: t.width,
        height: t.height,
      })),
      tags: details.tags ?? [],
      category: details.category ?? null,
      isLive: details.is_live ?? false,
    };
  } catch {
    return null;
  }
}

export async function getStreamUrls(videoId: string) {
  const yt = await getClient();
  const info = await yt.getInfo(videoId);
  const formats = info.streaming_data?.adaptive_formats ?? info.streaming_data?.formats ?? [];

  return formats
    .filter((f) => f.has_audio || f.has_video)
    .map((f) => ({
      itag: f.itag,
      url: f.url,
      mimeType: f.mime_type,
      quality: f.quality_label ?? f.quality,
      bitrate: f.bitrate,
      width: f.width,
      height: f.height,
      fps: f.fps,
      hasAudio: f.has_audio,
      hasVideo: f.has_video,
      contentLength: f.content_length,
    }))
    .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));
}

export async function getThumbnails(videoId: string) {
  const info = await getVideoInfo(videoId);
  if (!info) return null;

  const standard = [
    { quality: "default", url: `https://img.youtube.com/vi/${videoId}/default.jpg`, width: 120, height: 90 },
    { quality: "mqdefault", url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, width: 320, height: 180 },
    { quality: "hqdefault", url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, width: 480, height: 360 },
    { quality: "sddefault", url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, width: 640, height: 480 },
    { quality: "maxresdefault", url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, width: 1280, height: 720 },
  ];

  return { videoId, thumbnails: [...standard, ...info.thumbnails.map((t, i) => ({ quality: `custom_${i}`, ...t }))] };
}

export async function getRelatedVideos(videoId: string, limit = 10) {
  try {
    const video = await getVideoInfo(videoId);
    if (!video) return [];
    const results = await searchVideos(`${video.title} ${video.channel.name}`, limit);
    return results.videos.filter((v) => v.id !== videoId);
  } catch {
    return [];
  }
}

export async function getPlaylist(playlistId: string) {
  const yt = await getClient();
  try {
    const playlist = await yt.getPlaylist(playlistId);
    const items = playlist.items?.slice(0, 50).map((entry) => {
      const v = (entry as { item?: unknown }).item ?? entry;
      if (v && typeof v === "object" && "type" in v && (v as { type: string }).type === "Video") {
        return mapVideoBasic(v);
      }
      if (v && typeof v === "object" && "id" in v) {
        return mapVideoBasic(v);
      }
      return null;
    }).filter(Boolean) ?? [];

    return {
      id: playlistId,
      title: playlist.info.title ?? "",
      description: playlist.info.description ?? "",
      videoCount: playlist.info.total_items ?? items.length,
      channel: {
        name: playlist.info.author?.name ?? "",
        id: playlist.info.author?.id ?? "",
      },
      videos: items,
    };
  } catch {
    return null;
  }
}

export async function getLyrics(videoId: string) {
  const yt = await getClient();
  try {
    const info = await yt.getInfo(videoId);
    const transcript = await info.getTranscript().catch(() => null);

    if (transcript?.transcript?.content?.body?.initial_segments) {
      const lines = transcript.transcript.content.body.initial_segments
        .map((seg: { snippet?: { text?: string }; start_ms?: string; startMs?: number }) => ({
          text: seg.snippet?.text ?? "",
          startMs: parseInt(seg.start_ms ?? String(seg.startMs ?? 0), 10),
        }))
        .filter((l: { text: string }) => l.text.trim());

      return {
        videoId,
        source: "youtube_transcript",
        language: (transcript as { selectedLanguage?: string }).selectedLanguage ?? "en",
        lines,
        fullText: lines.map((l: { text: string }) => l.text).join("\n"),
      };
    }

    return {
      videoId,
      source: "unavailable",
      language: null,
      lines: [],
      fullText: null,
      message: "No lyrics or captions available for this video",
    };
  } catch {
    return null;
  }
}
