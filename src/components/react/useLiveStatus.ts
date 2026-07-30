import { useEffect, useRef, useState } from 'react';

/**
 * Polls /api/live-status for the LIVE badge. The route exists only under
 * `wrangler dev` or a real deploy; `astro dev` 404s harmlessly, and the loop
 * deliberately keeps going. Every failure resolves to "not live" — the badge is
 * decorative. CONCERNS.md C-17, C-22.
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
        // A non-answer clears the badge too, or a 5xx pins it on — C-17.
        setIsLive(Boolean(data?.isLive));
      } catch {
        if (cancelled) return;
        setIsLive(false);
      }

      // Always reschedule: the loop must never terminate — C-17.
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
