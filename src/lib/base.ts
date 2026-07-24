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
