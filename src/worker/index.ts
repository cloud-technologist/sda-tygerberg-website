import { getLiveStatus, type Env } from './liveStatus';

/**
 * Thin API layer in front of the static Astro build. Static assets are served
 * as-is via the ASSETS binding; anything under /api/* is handled here. Add
 * future routes (contact form, CMS-backed schedule/department data, etc.) as
 * additional branches below, or split into src/worker/routes/* as they grow.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/live-status') {
      const status = await getLiveStatus(env);
      return Response.json(status, {
        headers: { 'Cache-Control': 'public, max-age=60' },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
