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
/** A blip shouldn't cost 15 minutes of badge coverage mid-service. */
const RETRY_INTERVAL_MS = 20_000;

/**
 * Sources that cannot change until someone edits config, so there's nothing
 * to gain from the fast cadence even though the window itself is open.
 */
const STATIC_SOURCES = ['not-configured', 'invalid-schedule'];

type LiveStatusResponse = {
  isLive?: boolean;
  source?: string;
  window?: { open?: boolean };
};

export function useLiveStatus(): boolean {
  const [isLive, setIsLive] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (import.meta.env.PUBLIC_HAS_API === 'false') return;

    let cancelled = false;

    const check = async () => {
      // Retry cadence by default: anything that isn't a clean answer is
      // treated as transient rather than as "stand down for 15 minutes".
      let nextDelay = RETRY_INTERVAL_MS;
      try {
        const res = await fetch('/api/live-status');
        const data = res.ok ? ((await res.json()) as LiveStatusResponse) : null;
        if (cancelled) return;
        // Clear the badge on any non-answer too. Without this a 5xx or a
        // deploy blip mid-stream would leave LIVE pinned on indefinitely,
        // since nothing would ever set it back to false.
        setIsLive(Boolean(data?.isLive));
        if (data) {
          const isStatic = data.source !== undefined && STATIC_SOURCES.includes(data.source);
          nextDelay = data.window?.open && !isStatic ? OPEN_INTERVAL_MS : CLOSED_INTERVAL_MS;
        }
      } catch {
        // Not fatal — the badge is cleared above and we retry shortly.
        if (cancelled) return;
        setIsLive(false);
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
