/// <reference types="@cloudflare/workers-types" />

import { type LiveStatusEnv } from './liveStatus';
import { getLiveStatusCached } from './liveStatusCache';
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
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/contact') {
      return handleContact(request, env);
    }

    if (pathname === '/api/live-status') {
      // One upstream call shared by every viewer in the colo — CONCERNS.md C-16.
      const { result, cached } = await getLiveStatusCached(request, env, ctx);
      return Response.json(
        { ...result, cached },
        {
          headers: {
            // The *browser* still never caches: the sharing happens edge-side,
            // where it can be bounded, and a pinned badge in someone's tab
            // could not be.
            'Cache-Control': 'no-store',
          },
        },
      );
    }

    return env.ASSETS.fetch(request);
  },
};
