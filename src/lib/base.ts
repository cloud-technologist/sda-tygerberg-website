/**
 * Prefixes a root-relative path with Astro's configured base (see
 * astro.config.mjs — set via the ASTRO_BASE env var for subpath deployments
 * like a GitHub Pages project site). Needed anywhere a link/asset path is
 * hardcoded in a React component rather than resolved by Astro's own routing.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

/**
 * The inverse of `withBase`: strips the configured base back off a pathname.
 *
 * Canonical URLs and the sitemap have to name where a page lives in
 * production, which is always the domain root. The devtest build serves the
 * same pages under a GitHub Pages subpath, so `Astro.url.pathname` there
 * carries a `/sda-tygerberg-website` prefix that must come off before the path
 * is resolved against the production origin — otherwise the preview advertises
 * canonicals for pages that don't exist.
 *
 * Pointing the preview's canonicals at production is deliberate: the GitHub
 * Pages copy is publicly crawlable and cannot be covered by a robots.txt (that
 * only works at a domain root we don't own), so this is what keeps it from
 * competing with the real site in search results.
 */
export function canonicalPath(pathname: string): string {
  const base = import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  if (!normalizedBase) return pathname;
  if (pathname === normalizedBase) return '/';
  return pathname.startsWith(`${normalizedBase}/`)
    ? pathname.slice(normalizedBase.length)
    : pathname;
}
