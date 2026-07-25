/// <reference types="@cloudflare/workers-types" />

import { isValidCronWindow, isWithinCronWindow } from './cronWindow';

export type LiveStatusEnv = {
  // Both required for a real check — set as Worker secrets (Workers & Pages ->
  // tygerberg-sda-website -> Settings -> Variables and Secrets), never as a
  // build-time/Actions variable, which would bake the key into the public bundle.
  YOUTUBE_API_KEY?: string;
  YOUTUBE_CHANNEL_ID?: string;
  // 5-field cron expression read as a *window* (see cronWindow.ts). YouTube is
  // only called while "now" falls inside it; the other six days of the week
  // cost zero quota. Defaults to the Sabbath morning service.
  //
  // The minute field should stay `*`: it decides whether the window is open,
  // not how often YouTube is polled. Narrowing it (`*\/5`) would close the
  // window between marks and make the badge blink out. Poll rate is set on the
  // client (see useLiveStatus.ts).
  LIVE_CHECK_CRON?: string;
  // IANA timezone the window is evaluated in.
  LIVE_CHECK_TZ?: string;
};

/** Saturdays (cron day-of-week 6), 06:00-11:59 — window closes at 12:00. */
const DEFAULT_CRON = '* 6-11 * * 6';
const DEFAULT_TZ = 'Africa/Johannesburg';

export type LiveStatusSource =
  | 'youtube-api'
  | 'outside-window'
  | 'not-configured'
  | 'invalid-schedule'
  | 'api-error';

export type LiveStatusResult = {
  isLive: boolean;
  source: LiveStatusSource;
  checkedAt: string;
  /** The window this was evaluated against, echoed back to make config mistakes obvious. */
  window: { cron: string; timeZone: string; open: boolean };
};

async function askYouTube(apiKey: string, channelId: string): Promise<boolean | null> {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'id');
  url.searchParams.set('channelId', channelId);
  url.searchParams.set('eventType', 'live');
  url.searchParams.set('type', 'video');
  url.searchParams.set('key', apiKey);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as { items?: unknown[] };
    return (data.items?.length ?? 0) > 0;
  } catch {
    return null;
  }
}

/**
 * Resolves whether the channel is currently streaming, spending YouTube API
 * quota only inside the configured window.
 *
 * No server-side caching: every in-window request is a live call to YouTube.
 * `search.list` costs 100 quota units against a 10,000/day default, so cost
 * scales with concurrent viewers — see the README quota note.
 */
export async function getLiveStatus(env: LiveStatusEnv, now = new Date()): Promise<LiveStatusResult> {
  const cron = env.LIVE_CHECK_CRON?.trim() || DEFAULT_CRON;
  const timeZone = env.LIVE_CHECK_TZ?.trim() || DEFAULT_TZ;
  const checkedAt = now.toISOString();

  if (!isValidCronWindow(cron, timeZone, now)) {
    return {
      isLive: false,
      source: 'invalid-schedule',
      checkedAt,
      window: { cron, timeZone, open: false },
    };
  }

  const open = isWithinCronWindow(cron, now, timeZone);
  const window = { cron, timeZone, open };

  if (!open) {
    return { isLive: false, source: 'outside-window', checkedAt, window };
  }

  if (!env.YOUTUBE_API_KEY || !env.YOUTUBE_CHANNEL_ID) {
    return { isLive: false, source: 'not-configured', checkedAt, window };
  }

  const isLive = await askYouTube(env.YOUTUBE_API_KEY, env.YOUTUBE_CHANNEL_ID);
  if (isLive === null) {
    // Network hiccup or quota exhaustion — hide the badge rather than guess.
    // The client keeps polling on its normal cadence and recovers on its own.
    return { isLive: false, source: 'api-error', checkedAt, window };
  }

  return { isLive, source: 'youtube-api', checkedAt, window };
}
