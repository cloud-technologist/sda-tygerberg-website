/// <reference types="@cloudflare/workers-types" />

export type Env = {
  ASSETS: Fetcher;
  // Optional — when both are set, /api/live-status calls the real YouTube Data API.
  YOUTUBE_API_KEY?: string;
  YOUTUBE_CHANNEL_ID?: string;
  // Manual fallback used whenever no API key is configured (MVP default).
  MANUAL_LIVE_FLAG?: string;
};

type LiveStatusResult = { isLive: boolean; source: 'youtube-api' | 'manual' };

/**
 * Checks whether the channel is currently live. Prefers the YouTube Data API
 * (search.list, eventType=live) when YOUTUBE_API_KEY + YOUTUBE_CHANNEL_ID are
 * configured as Worker secrets/vars; otherwise falls back to the manual flag.
 * Callers should always render the uploads-playlist embed regardless of this
 * result — it's only used to show/hide the LIVE badge.
 */
export async function getLiveStatus(env: Env): Promise<LiveStatusResult> {
  if (env.YOUTUBE_API_KEY && env.YOUTUBE_CHANNEL_ID) {
    try {
      const url = new URL('https://www.googleapis.com/youtube/v3/search');
      url.searchParams.set('part', 'id');
      url.searchParams.set('channelId', env.YOUTUBE_CHANNEL_ID);
      url.searchParams.set('eventType', 'live');
      url.searchParams.set('type', 'video');
      url.searchParams.set('key', env.YOUTUBE_API_KEY);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = (await res.json()) as { items?: unknown[] };
        return { isLive: (data.items?.length ?? 0) > 0, source: 'youtube-api' };
      }
    } catch {
      // Fall through to the manual flag on any network/API error.
    }
  }

  return { isLive: env.MANUAL_LIVE_FLAG === 'true', source: 'manual' };
}
