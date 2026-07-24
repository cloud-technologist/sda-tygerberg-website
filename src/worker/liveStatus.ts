/// <reference types="@cloudflare/workers-types" />

export type Env = {
  ASSETS: Fetcher;
  // Optional — when both are set, live status is checked against the real
  // YouTube Data API instead of the manual flag.
  YOUTUBE_API_KEY?: string;
  YOUTUBE_CHANNEL_ID?: string;
  // Manual fallback used whenever no API key is configured (MVP default).
  MANUAL_LIVE_FLAG?: string;
  // Optional — when bound, a scheduled poll (see the `scheduled` handler in
  // index.ts + `triggers.crons` in wrangler.jsonc) caches the result here so
  // per-request reads are a cheap KV read instead of a YouTube API call.
  LIVE_STATUS_KV?: KVNamespace;
};

type LiveStatusResult = {
  isLive: boolean;
  source: 'youtube-api' | 'manual';
  checkedAt: string;
};

type LiveStatusResponse = LiveStatusResult & { cached: boolean };

const KV_KEY = 'live-status';
// Safety net in case the cron trigger stops firing — the cached value expires
// rather than going stale forever.
const KV_TTL_SECONDS = 60 * 20;

async function checkYouTubeLiveStatus(env: Env): Promise<LiveStatusResult> {
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
        return {
          isLive: (data.items?.length ?? 0) > 0,
          source: 'youtube-api',
          checkedAt: new Date().toISOString(),
        };
      }
    } catch {
      // Fall through to the manual flag on any network/API error.
    }
  }

  return {
    isLive: env.MANUAL_LIVE_FLAG === 'true',
    source: 'manual',
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Runs on a schedule (see `triggers.crons` in wrangler.jsonc) to poll YouTube
 * and cache the result in KV. A no-op when LIVE_STATUS_KV isn't bound, so
 * the site still deploys and works without it — see README for opt-in setup.
 */
export async function pollAndCacheLiveStatus(env: Env): Promise<void> {
  if (!env.LIVE_STATUS_KV) return;
  const result = await checkYouTubeLiveStatus(env);
  await env.LIVE_STATUS_KV.put(KV_KEY, JSON.stringify(result), {
    expirationTtl: KV_TTL_SECONDS,
  });
}

/**
 * Used by the /api/live-status route. Prefers the cached (polled) value when
 * LIVE_STATUS_KV is bound; otherwise checks directly on every request (fine
 * for local dev or a KV-less deploy, just costs one YouTube API call per
 * page load instead of one per poll interval).
 * Callers should always render the uploads-playlist embed regardless of this
 * result — it's only used to show/hide the LIVE badge.
 */
export async function getLiveStatus(env: Env): Promise<LiveStatusResponse> {
  if (env.LIVE_STATUS_KV) {
    const cached = await env.LIVE_STATUS_KV.get(KV_KEY);
    if (cached) return { ...(JSON.parse(cached) as LiveStatusResult), cached: true };
  }

  return { ...(await checkYouTubeLiveStatus(env)), cached: false };
}
