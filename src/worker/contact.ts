/// <reference types="@cloudflare/workers-types" />

export type ContactEnv = {
  // Where a validated submission is delivered. Any endpoint accepting a JSON
  // POST works (Zapier / Make / Apps Script / n8n / a church inbox webhook),
  // which keeps the church off any one vendor. Set it as a Worker secret —
  // it's a delivery address, and a public one invites spam.
  //
  // Until it's set the route answers `not-configured` and the form tells the
  // visitor so, the same way the LIVE badge degrades (see liveStatus.ts).
  CONTACT_WEBHOOK_URL?: string;
};

/** Which page the request came from — decides who the church routes it to. */
export type ContactTopic = 'connect' | 'bible-study';

export type ContactOutcome = 'forwarded' | 'not-configured' | 'invalid' | 'forward-error';

export type ContactResult = {
  ok: boolean;
  outcome: ContactOutcome;
  /** Field names that failed validation, so the form can mark them inline. */
  errors?: string[];
};

const TOPICS: ContactTopic[] = ['connect', 'bible-study'];

// Generous enough for a real message, tight enough that a bot can't post a
// megabyte through the church's webhook.
const LIMITS = {
  name: 80,
  email: 254,
  phone: 40,
  message: 2000,
} as const;

/** Deliberately loose. Real deliverability is proven by replying, not by a regex. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_BODY_BYTES = 16 * 1024;
const FORWARD_TIMEOUT_MS = 10_000;

type RawBody = Record<string, unknown>;

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function json(result: ContactResult, status: number): Response {
  return Response.json(result, {
    status,
    // A submission result is per-request and never cacheable.
    headers: { 'Cache-Control': 'no-store' },
  });
}

/**
 * Validates a submission and returns the cleaned payload, or the list of
 * fields that failed.
 *
 * Consent is a hard requirement, not a nicety: POPIA needs the visitor to
 * actively opt in before the church may store or act on their details, so a
 * missing `consent` is as fatal as a missing name.
 */
function validate(body: RawBody): { errors: string[]; clean?: Record<string, string> } {
  const errors: string[] = [];

  const topic = str(body.topic);
  if (!TOPICS.includes(topic as ContactTopic)) errors.push('topic');

  const name = str(body.name);
  if (!name || name.length > LIMITS.name) errors.push('name');

  const email = str(body.email);
  if (email && (email.length > LIMITS.email || !EMAIL_RE.test(email))) errors.push('email');

  const phone = str(body.phone);
  if (phone.length > LIMITS.phone) errors.push('phone');

  // Nothing to reply to otherwise. Either channel is fine — some people would
  // rather be phoned than emailed, and requiring both collects more personal
  // data than answering the request actually needs.
  if (!email && !phone) errors.push('contact');

  const message = str(body.message);
  if (message.length > LIMITS.message) errors.push('message');

  if (body.consent !== true) errors.push('consent');

  if (errors.length > 0) return { errors };

  return { errors, clean: { topic, name, email, phone, message } };
}

async function forward(url: string, payload: unknown): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    // Timeout, DNS, TLS — the caller turns this into `forward-error` so the
    // visitor is told to try again rather than believing it was delivered.
    return false;
  }
}

/**
 * Handles POST /api/contact for the /connect and /bible-studies forms.
 *
 * Never reports success it can't back up: a submission is only `forwarded`
 * once the webhook has actually accepted it. Silently swallowing a failed
 * delivery would leave someone waiting for a reply that was never going to
 * come.
 */
export async function handleContact(request: Request, env: ContactEnv): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ ok: false, outcome: 'invalid', errors: ['method'] }, 405);
  }

  // Content-Length is a claim, not a fact: a chunked request can omit it and a
  // junk value parses to NaN, either of which slips past a `>` test. Keep it
  // as a cheap early-out, but let the measured size be the one that decides.
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ ok: false, outcome: 'invalid', errors: ['body'] }, 413);
  }

  let raw: ArrayBuffer;
  try {
    raw = await request.arrayBuffer();
  } catch {
    return json({ ok: false, outcome: 'invalid', errors: ['body'] }, 400);
  }
  if (raw.byteLength > MAX_BODY_BYTES) {
    return json({ ok: false, outcome: 'invalid', errors: ['body'] }, 413);
  }

  let body: RawBody;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(raw));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object');
    body = parsed as RawBody;
  } catch {
    return json({ ok: false, outcome: 'invalid', errors: ['body'] }, 400);
  }

  // Bot filtering is Cloudflare's job, not this handler's — Bot Fight Mode and
  // the WAF rate-limiting rule sit in front of this route at the edge (see
  // SETUP-INSTRUCTIONS.md §3.5). A hidden honeypot field used to live here; it
  // was removed because a password manager filling it would silently bin a
  // real person's message, and it never stopped a bot that simply omitted the
  // field anyway.
  const { errors, clean } = validate(body);
  if (!clean) return json({ ok: false, outcome: 'invalid', errors }, 400);

  if (!env.CONTACT_WEBHOOK_URL) {
    return json({ ok: false, outcome: 'not-configured' }, 503);
  }

  const delivered = await forward(env.CONTACT_WEBHOOK_URL, {
    ...clean,
    submittedAt: new Date().toISOString(),
    // Recorded because POPIA consent has to be demonstrable after the fact,
    // and the church's inbox is the only place this submission survives.
    consent: true,
    source: 'tygerberg-sda-website',
  });

  return delivered
    ? json({ ok: true, outcome: 'forwarded' }, 200)
    : json({ ok: false, outcome: 'forward-error' }, 502);
}
