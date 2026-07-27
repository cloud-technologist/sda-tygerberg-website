import { useState, type FormEvent } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { withBase } from '../../lib/base';
import { requestFormCopy, type RequestTopic, type TopicCopy } from '../../data/requestCopy';

/**
 * The shared request form behind /verbind and /bybelstudies. Posts to the
 * Worker's /api/contact route (src/worker/contact.ts).
 *
 * The GitHub Pages devtest build sets PUBLIC_HAS_API=false — there's no Worker
 * there, so the form renders read-only with a notice rather than accepting a
 * submission it can't deliver. The var is inlined at build time, so server and
 * client agree and hydration stays clean.
 */
const HAS_API = import.meta.env.PUBLIC_HAS_API !== 'false';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = 'idle' | 'submitting' | 'success' | 'error';

type ContactResponse = {
  ok?: boolean;
  outcome?: 'forwarded' | 'not-configured' | 'invalid' | 'forward-error';
  errors?: string[];
};

const EMPTY = { name: '', email: '', phone: '', message: '', website: '' };

export function RequestForm({ topic, copy }: { topic: RequestTopic; copy: TopicCopy }) {
  const { lang } = useLanguage();
  const t = requestFormCopy[lang];

  const [values, setValues] = useState(EMPTY);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const reset = () => {
    setValues(EMPTY);
    setConsent(false);
    setStatus('idle');
    setFieldErrors([]);
    setMessage('');
  };

  /** Mirrors the Worker's rules so obvious mistakes don't need a round trip. */
  const validate = (): string[] => {
    const errors: string[] = [];
    if (!values.name.trim()) errors.push('name');
    if (!values.email.trim() && !values.phone.trim()) errors.push('contact');
    if (values.email.trim() && !EMAIL_RE.test(values.email.trim())) errors.push('email');
    if (!consent) errors.push('consent');
    return errors;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    const errors = validate();
    if (errors.length > 0) {
      setFieldErrors(errors);
      setStatus('error');
      setMessage(t.errValidation);
      return;
    }

    setStatus('submitting');
    setFieldErrors([]);
    setMessage('');

    try {
      const res = await fetch(withBase('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          message: values.message.trim(),
          website: values.website,
          consent: true,
        }),
      });

      const data = (await res.json().catch(() => null)) as ContactResponse | null;

      if (data?.ok) {
        setStatus('success');
        return;
      }

      setStatus('error');
      if (data?.outcome === 'not-configured') setMessage(t.errNotConfigured);
      else if (data?.outcome === 'forward-error') setMessage(t.errForward);
      else if (data?.outcome === 'invalid') {
        setFieldErrors(data.errors ?? []);
        setMessage(t.errValidation);
      } else setMessage(t.errNetwork);
    } catch {
      // Offline, DNS, a 404 body that isn't JSON — never claim it was sent.
      setStatus('error');
      setMessage(t.errNetwork);
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-card-lg border border-navy/20 bg-cream-card p-7 text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-navy text-xl text-white">
          ✓
        </div>
        <h2 className="mb-2 font-serif text-2xl text-ink">{t.successHeading}</h2>
        <p className="mb-5 text-[15px] leading-relaxed text-slate">{t.successBody}</p>
        <button
          type="button"
          onClick={reset}
          className="rounded-pill border-[1.5px] border-navy px-5 py-2.5 text-[13.5px] font-bold text-navy transition-colors hover:bg-navy hover:text-white"
        >
          {t.successAgain}
        </button>
      </div>
    );
  }

  const invalid = (field: string) => fieldErrors.includes(field);
  const fieldClass = (field: string) =>
    `w-full rounded-card border bg-cream-card px-4 py-3 text-[15px] text-ink placeholder:text-slate-muted/70 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15 ${
      invalid(field) ? 'border-orange-hover' : 'border-strong'
    }`;
  const labelClass = 'mb-1.5 block text-[13.5px] font-bold text-ink';
  const errClass = 'mt-1.5 text-[13px] font-medium text-orange-hover';

  return (
    <form onSubmit={submit} noValidate className="rounded-card-lg border border-subtle bg-tan/40 p-6 sm:p-7">
      {!HAS_API && (
        <p className="mb-6 rounded-card border border-orange/40 bg-orange/10 px-4 py-3 text-[13.5px] leading-relaxed text-ink">
          {t.previewNotice}
        </p>
      )}

      <fieldset disabled={!HAS_API || status === 'submitting'} className="disabled:opacity-60">
        <div className="mb-5">
          <label htmlFor="req-name" className={labelClass}>
            {t.nameLabel}
          </label>
          <input
            id="req-name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={set('name')}
            aria-invalid={invalid('name')}
            className={fieldClass('name')}
          />
          {invalid('name') && <p className={errClass}>{t.errName}</p>}
        </div>

        <div className="mb-2 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="req-email" className={labelClass}>
              {t.emailLabel}
            </label>
            <input
              id="req-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={values.email}
              onChange={set('email')}
              aria-invalid={invalid('email') || invalid('contact')}
              className={fieldClass(invalid('email') ? 'email' : 'contact')}
            />
            {invalid('email') && <p className={errClass}>{t.errEmail}</p>}
          </div>
          <div>
            <label htmlFor="req-phone" className={labelClass}>
              {t.phoneLabel}
            </label>
            <input
              id="req-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={set('phone')}
              aria-invalid={invalid('contact')}
              className={fieldClass('contact')}
            />
          </div>
        </div>
        <p className="mb-5 text-[13px] text-slate-muted">{t.contactHint}</p>
        {invalid('contact') && <p className={`${errClass} -mt-4 mb-5`}>{t.errContact}</p>}

        <div className="mb-6">
          <label htmlFor="req-message" className={labelClass}>
            {copy.messageLabel}{' '}
            <span className="font-medium text-slate-muted">({t.optional})</span>
          </label>
          <textarea
            id="req-message"
            name="message"
            rows={5}
            maxLength={2000}
            placeholder={copy.messagePlaceholder}
            value={values.message}
            onChange={set('message')}
            className={`${fieldClass('message')} resize-y`}
          />
        </div>

        {/* Honeypot: hidden from people, irresistible to form bots. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="req-website">Website</label>
          <input
            id="req-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={set('website')}
          />
        </div>

        <div className="mb-6 rounded-card border border-subtle bg-cream-card p-4.5">
          <div className="mb-1.5 text-xs font-bold uppercase tracking-[.08em] text-navy">
            {t.privacyHeading}
          </div>
          <p className="mb-4 text-[13.5px] leading-relaxed text-slate">{t.privacyBody}</p>
          <label htmlFor="req-consent" className="flex cursor-pointer items-start gap-3">
            <input
              id="req-consent"
              name="consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              aria-invalid={invalid('consent')}
              className="mt-0.5 h-4.5 w-4.5 flex-none accent-navy"
            />
            <span className="text-[13.5px] leading-relaxed text-ink">{t.consentLabel}</span>
          </label>
          {invalid('consent') && <p className={errClass}>{t.errConsent}</p>}
        </div>

        <button
          type="submit"
          className="w-full rounded-pill bg-orange px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-orange-hover disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? t.submitting : copy.submit}
        </button>
      </fieldset>

      {status === 'error' && message && (
        <p
          role="alert"
          className="mt-5 rounded-card border border-orange-hover/40 bg-orange/10 px-4 py-3 text-[13.5px] leading-relaxed text-ink"
        >
          {message}
        </p>
      )}
    </form>
  );
}
