/// <reference types="@cloudflare/workers-types" />

import { getLiveStatus, type LiveStatusEnv } from './liveStatus';

export type Env = LiveStatusEnv & {
  ASSETS: Fetcher;
};

/**
 * Serves the static Astro build via the ASSETS binding, plus a single API
 * route. Add future routes (contact form, CMS-backed schedule/department
 * data, etc.) as branches here, or split into src/worker/routes/* as they grow.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/live-status') {
      const status = await getLiveStatus(env);
      return Response.json(status, {
        headers: {
          // Cosmetic and time-sensitive — never let an edge or browser cache
          // pin the badge on after the stream ends.
          'Cache-Control': 'no-store',
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
