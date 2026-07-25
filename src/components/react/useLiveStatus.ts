import { useEffect, useRef, useState } from 'react';

/**
 * Polls the Worker's /api/live-status route to decide whether to show the
 * LIVE badge. The route only exists under `wrangler dev` or a real deploy.
 *
 * The GitHub Pages build sets PUBLIC_HAS_API=false to skip polling entirely,
 * since that deploy has no Worker and the route would 404 forever. Under
 * plain `astro dev` the var is unset, so the hook *does* poll and each
 * request 404s — harmless (the badge just stays hidden) and left deliberately
 * rather than stopping on 404: a 404 in production means a bad deploy or a
 * mid-deploy blip, and the badge has to recover once that resolves. Use
 * `npm run worker:dev` to exercise the route locally.
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
