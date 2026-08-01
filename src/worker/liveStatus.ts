/// <reference types="@cloudflare/workers-types" />

import { isValidCronWindow, isWithinCronWindow } from './cronWindow';

export type LiveStatusEnv = {
  // Worker secrets, never build-time variables — CONCERNS.md C-18.
  YOUTUBE_API_KEY?: string;
  YOUTUBE_CHANNEL_ID?: string;
  // 5-field cron read as a *window*, not a schedule. Keep the minute field
  // `*` — CONCERNS.md C-14.
  LIVE_CHECK_CRON?: string;
  // IANA timezone the window is evaluated in.
  LIVE_CHECK_TZ?: string;
};

/**
 * Saturdays (cron day-of-week 6), 09:00-12:59. The church streams 09:00-12:30;
 * the hour field cannot express :30, and running long only permits polling —
 * C-14.
 */
const DEFAULT_CRON = '* 9-12 * * 6';
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

/**
 * Asks whether the channel is streaming. `null` means "could not tell" — a
 * network hiccup or exhausted quota — as distinct from a confident `false`.
 *
 * Injectable so the caching layer can wrap *this* rather than the whole
 * verdict: the window and credential checks must run on every request, or a
 * cached answer would keep the badge alive past the window's close — C-16.
 */
export type AskLive = (apiKey: string, channelId: string) => Promise<boolean | null>;

export const askYouTube: AskLive = async (apiKey, channelId) => {
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
};

/**
 * Is the channel streaming? Spends quota only inside the configured window.
 *
 * The window and credential checks always run here, on every request. Only
 * `ask` is ever cached, by `liveStatusCache.ts` — caching this verdict instead
 * would let a result from inside the window keep the badge alive after the
 * window closed. CONCERNS.md C-16.
 */
export async function getLiveStatus(
  env: LiveStatusEnv,
  now = new Date(),
  ask: AskLive = askYouTube,
): Promise<LiveStatusResult> {
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

  const isLive = await ask(env.YOUTUBE_API_KEY, env.YOUTUBE_CHANNEL_ID);
  if (isLive === null) {
    // Hiccup or exhausted quota: hide the badge, let the client recover.
    return { isLive: false, source: 'api-error', checkedAt, window };
  }

  return { isLive, source: 'youtube-api', checkedAt, window };
}
