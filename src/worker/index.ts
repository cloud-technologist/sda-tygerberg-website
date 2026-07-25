/// <reference types="@cloudflare/workers-types" />

export type Env = {
  ASSETS: Fetcher;
};

/**
 * Thin passthrough in front of the static Astro build, serving assets via
 * the ASSETS binding. Add future API routes (contact form, CMS-backed
 * schedule/department data, etc.) as branches here, or split into
 * src/worker/routes/* as they grow.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.ASSETS.fetch(request);
  },
};
