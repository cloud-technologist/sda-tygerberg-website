import { useEffect, useState } from 'react';

/**
 * Polls the Worker's /api/live-status route. Only available when running via
 * `wrangler dev`/deployed (not plain `astro dev`), so failures are swallowed
 * and default to false — the stream box always falls back to the uploads
 * playlist embed regardless of this flag.
 *
 * The GitHub Pages devtest build is static-only (no Worker), so it sets
 * PUBLIC_HAS_API=false at build time to skip the request entirely rather
 * than poll an endpoint that will always 404.
 */
export function useLiveStatus(): boolean {
  const [isLive, setIsLive] = useState(false);
  const hasApi = import.meta.env.PUBLIC_HAS_API !== 'false';

  useEffect(() => {
    if (!hasApi) return;
    let cancelled = false;

    const check = () => {
      fetch('/api/live-status')
        .then((res) => (res.ok ? res.json() : null))
        .then((data: unknown) => {
          if (!cancelled && data && typeof data === 'object' && 'isLive' in data) {
            setIsLive(Boolean((data as { isLive?: boolean }).isLive));
          }
        })
        .catch(() => {
          // Not fatal — the LIVE badge just stays hidden.
        });
    };

    check();
    const interval = setInterval(check, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return isLive;
}
