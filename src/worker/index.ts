/// <reference types="@cloudflare/workers-types" />

import { getLiveStatus, type LiveStatusEnv } from './liveStatus';
import { handleContact, type ContactEnv } from './contact';

export type Env = LiveStatusEnv &
  ContactEnv & {
    ASSETS: Fetcher;
  };

/**
 * Serves the static build via the ASSETS binding, plus the API routes. Add new
 * ones as branches here, or split into src/worker/routes/* as they grow.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/contact') {
      return handleContact(request, env);
    }

    if (pathname === '/api/live-status') {
      const status = await getLiveStatus(env);
      return Response.json(status, {
        headers: {
          // Never let a cache pin the badge on after the stream ends.
          'Cache-Control': 'no-store',
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
