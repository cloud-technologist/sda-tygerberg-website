/// <reference types="@cloudflare/workers-types" />

import { sendContactEmail, type ContactEmailEnv } from './contactEmail';

export type ContactEnv = ContactEmailEnv & {
  // Any endpoint accepting a JSON POST. A Worker secret, not a build-time var:
  // it is a delivery address, and a public one invites spam. Unset answers
  // `not-configured` and the form says so.
  //
  // The fallback channel now: email is tried first when it is configured — see
  // `deliver()` below and C-31.
  CONTACT_WEBHOOK_URL?: string;
};

/** Which page the request came from — decides who the church routes it to. */
export type ContactTopic = 'connect' | 'bible-study';

export type ContactOutcome = 'forwarded' | 'not-configured' | 'invalid' | 'forward-error';

/** Which channel actually carried it. Diagnostic only — the form ignores it. */
export type ContactVia = 'email' | 'webhook';

export type ContactResult = {
  ok: boolean;
  outcome: ContactOutcome;
  /** Field names that failed validation, so the form can mark them inline. */
  errors?: string[];
  /** Present only on `forwarded`. */
  via?: ContactVia;
};

const TOPICS: ContactTopic[] = ['connect', 'bible-study'];

// Room for a real message; not room for a bot to post a megabyte.
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
 * Validates a submission, returning the cleaned payload or the failed fields.
 * Missing consent is as fatal as a missing name — CONCERNS.md C-20.
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

  // Either channel is fine; requiring both collects more than is needed (C-20).
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
    // Timeout, DNS, TLS. Becomes `forward-error` — C-19.
    return false;
  }
}

/**
 * Delivers one submission, preferring email. Returns the channel that carried
 * it, or `null` if every configured channel failed.
 *
 * Email first because it needs no third-party service and lands in an inbox a
 * person already reads; the webhook stays as the fallback so an account without
 * Email Service onboarding still works. Both configured means the webhook is
 * only reached when email fails — deliberately not both at once, which would
 * double every enquiry. CONCERNS.md C-31.
 */
async function deliver(env: ContactEnv, clean: Record<string, string>): Promise<ContactVia | null> {
  const submittedAt = new Date().toISOString();

  if (await sendContactEmail(env, clean, submittedAt)) return 'email';

  if (env.CONTACT_WEBHOOK_URL) {
    const sent = await forward(env.CONTACT_WEBHOOK_URL, {
      ...clean,
      submittedAt,
      // Recorded because POPIA consent has to be demonstrable after the fact,
      // and the church's inbox is the only place this submission survives.
      consent: true,
      source: 'tygerberg-sda-website',
    });
    if (sent) return 'webhook';
  }

  return null;
}

/** Is any delivery channel set up at all? Decides `not-configured` vs a failure. */
function isConfigured(env: ContactEnv): boolean {
  const email = Boolean(env.EMAIL && env.CONTACT_EMAIL_TO && env.CONTACT_EMAIL_FROM);
  return email || Boolean(env.CONTACT_WEBHOOK_URL);
}

/**
 * POST /api/contact for the /connect and /bible-studies forms. Only reports
 * `forwarded` once a channel has actually accepted it — CONCERNS.md C-19.
 */
export async function handleContact(request: Request, env: ContactEnv): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ ok: false, outcome: 'invalid', errors: ['method'] }, 405);
  }

  // Content-Length is a claim, not a fact — a chunked request omits it and junk
  // parses to NaN, both slipping past a `>` test. Cheap early-out only; the
  // measured size decides.
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

  // Bot filtering is Cloudflare's, at the edge — CONCERNS.md C-21.
  const { errors, clean } = validate(body);
  if (!clean) return json({ ok: false, outcome: 'invalid', errors }, 400);

  if (!isConfigured(env)) {
    return json({ ok: false, outcome: 'not-configured' }, 503);
  }

  const via = await deliver(env, clean);

  return via
    ? json({ ok: true, outcome: 'forwarded', via }, 200)
    : json({ ok: false, outcome: 'forward-error' }, 502);
}
