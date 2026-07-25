import { useEffect, useRef, useState } from 'react';

/**
 * Polls the Worker's /api/live-status route to decide whether to show the
 * LIVE badge. Only available when running via `wrangler dev` or deployed —
 * plain `astro dev` and the static GitHub Pages build have no Worker, so
 * PUBLIC_HAS_API=false skips the request entirely rather than polling an
 * endpoint that will always 404.
 *
 * Every failure mode resolves to "not live": the badge is decorative, and
 * the video embed below it works regardless.
 */

/** While a service could be on air, check often enough to be useful. */
const OPEN_INTERVAL_MS = 60_000;
/** Outside the configured window the answer is a foregone "no" — barely poll. */
const CLOSED_INTERVAL_MS = 15 * 60_000;

type LiveStatusResponse = {
  isLive?: boolean;
  window?: { open?: boolean };
};

export function useLiveStatus(): boolean {
  const [isLive, setIsLive] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (import.meta.env.PUBLIC_HAS_API === 'false') return;

    let cancelled = false;

    const check = async () => {
      let nextDelay = CLOSED_INTERVAL_MS;
      try {
        const res = await fetch('/api/live-status');
        if (res.ok) {
          const data = (await res.json()) as LiveStatusResponse;
          if (cancelled) return;
          setIsLive(Boolean(data.isLive));
          nextDelay = data.window?.open ? OPEN_INTERVAL_MS : CLOSED_INTERVAL_MS;
        }
      } catch {
        // Not fatal — the badge stays hidden and we retry on the slow cadence.
      }
      if (!cancelled) timeoutRef.current = setTimeout(check, nextDelay);
    };

    void check();

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return isLive;
}
