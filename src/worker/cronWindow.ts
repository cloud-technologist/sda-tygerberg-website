/**
 * Minimal cron-expression matcher, used as a *predicate on the current time*
 * rather than as a scheduler.
 *
 * Standard 5-field syntax — `minute hour day-of-month month day-of-week` —
 * supporting `*`, `5`, `9-12`, `1,3,5`, and step values (`*\/15`, `9-17/2`).
 * Day-of-week is 0-6 with 0 = Sunday (7 is accepted as Sunday too, as most
 * cron implementations do).
 *
 * Reading a cron expression as a window is what makes `* 9-12 * * 6` mean
 * "any minute between 09:00 and 12:59 on Saturdays" — which is exactly the
 * Sabbath service window we want to limit YouTube API calls to.
 */

const FIELD_RANGES: { min: number; max: number }[] = [
  { min: 0, max: 59 }, // minute
  { min: 0, max: 23 }, // hour
  { min: 1, max: 31 }, // day of month
  { min: 1, max: 12 }, // month
  { min: 0, max: 7 }, // day of week (0 and 7 are both Sunday)
];

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function matchField(field: string, value: number, min: number, max: number): boolean {
  // A field matches if *any* comma-separated term matches.
  return field.split(',').some((term) => {
    const [range, stepText] = term.split('/');
    const step = stepText === undefined ? 1 : Number(stepText);
    if (!Number.isInteger(step) || step < 1) return false;

    let lo: number;
    let hi: number;
    if (range === '*') {
      lo = min;
      hi = max;
    } else if (range.includes('-')) {
      const [a, b] = range.split('-');
      lo = Number(a);
      hi = Number(b);
    } else {
      lo = Number(range);
      hi = lo;
    }

    if (!Number.isInteger(lo) || !Number.isInteger(hi)) return false;
    if (lo < min || hi > max || lo > hi) return false;
    if (value < lo || value > hi) return false;
    return (value - lo) % step === 0;
  });
}

type ZonedNow = {
  minute: number;
  hour: number;
  dayOfMonth: number;
  month: number;
  dayOfWeek: number;
};

/**
 * Breaks `now` into calendar fields as observed in `timeZone`, so the window
 * is expressed in local church time (SAST) and stays correct regardless of
 * the timezone the Worker happens to execute in.
 */
export function zonedNow(now: Date, timeZone: string): ZonedNow | null {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).formatToParts(now);
  } catch {
    // Unknown/invalid IANA timezone name.
    return null;
  }

  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  const dayOfWeek = WEEKDAY_INDEX[lookup('weekday')];
  if (dayOfWeek === undefined) return null;

  return {
    minute: Number(lookup('minute')),
    hour: Number(lookup('hour')),
    dayOfMonth: Number(lookup('day')),
    month: Number(lookup('month')),
    dayOfWeek,
  };
}

/**
 * True when `now`, as observed in `timeZone`, falls inside the window
 * described by the 5-field cron expression.
 *
 * Returns false for a malformed expression or an unknown timezone. That
 * fail-closed choice is deliberate: the caller uses this to decide whether
 * to spend YouTube API quota, and a typo should cost nothing rather than
 * quietly billing every request. Misconfiguration is surfaced by the
 * `invalid-schedule` source on the /api/live-status response.
 */
export function isWithinCronWindow(expression: string, now: Date, timeZone: string): boolean {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) return false;

  const zoned = zonedNow(now, timeZone);
  if (zoned === null) return false;

  // Sunday is 0 in our lookup; also accept 7 in the expression.
  const dowMatches =
    matchField(fields[4], zoned.dayOfWeek, FIELD_RANGES[4].min, FIELD_RANGES[4].max) ||
    (zoned.dayOfWeek === 0 && matchField(fields[4], 7, FIELD_RANGES[4].min, FIELD_RANGES[4].max));

  return (
    matchField(fields[0], zoned.minute, FIELD_RANGES[0].min, FIELD_RANGES[0].max) &&
    matchField(fields[1], zoned.hour, FIELD_RANGES[1].min, FIELD_RANGES[1].max) &&
    matchField(fields[2], zoned.dayOfMonth, FIELD_RANGES[2].min, FIELD_RANGES[2].max) &&
    matchField(fields[3], zoned.month, FIELD_RANGES[3].min, FIELD_RANGES[3].max) &&
    dowMatches
  );
}

/** Cheap syntax check used to report misconfiguration instead of silently never matching. */
export function isValidCronWindow(expression: string, timeZone: string): boolean {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) return false;
  if (zonedNow(new Date(), timeZone) === null) return false;
  // Every field must match at least one value in its range, otherwise the
  // expression can never fire and is almost certainly a typo.
  return fields.every((field, i) => {
    const { min, max } = FIELD_RANGES[i];
    for (let v = min; v <= max; v += 1) if (matchField(field, v, min, max)) return true;
    return false;
  });
}
