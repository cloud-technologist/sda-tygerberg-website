import { useEffect, useRef, useState } from 'react';

/**
 * Polls the Worker's /api/live-status route to decide whether to show the
 * LIVE badge. Only available when running via `wrangler dev` or deployed —
 * plain `astro dev` and the static GitHub Pages build have no Worker, so
 * PUBLIC_HAS_API=false skips the request entirely rather than polling an
 * endpoint that will always 404.
 *
 * Every failure mode resolves to "not live": the badge is decorative, and the
 * video embed below it works regardless.
 */

/** One cadence for every case — open, closed, or failed. */
const POLL_INTERVAL_MS = 5 * 60_000;

type LiveStatusResponse = {
  isLive?: boolean;
};

export function useLiveStatus(): boolean {
  const [isLive, setIsLive] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (import.meta.env.PUBLIC_HAS_API === 'false') return;

    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch('/api/live-status');
        const data = res.ok ? ((await res.json()) as LiveStatusResponse) : null;
        if (cancelled) return;
        // Clear the badge on a non-answer too. Without this a 5xx or a deploy
        // blip mid-stream would leave LIVE pinned on indefinitely, since
        // nothing would ever set it back to false.
        setIsLive(Boolean(data?.isLive));
      } catch {
        if (cancelled) return;
        setIsLive(false);
      }

      // Always reschedule, whatever happened above. A failed or unanswerable
      // check must not end the polling loop — the badge has to be able to
      // recover on its own once the Worker or the API comes back.
      if (!cancelled) timeoutRef.current = setTimeout(check, POLL_INTERVAL_MS);
    };

    void check();

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return isLive;
}
