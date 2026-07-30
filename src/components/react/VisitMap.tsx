import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { homeCopy } from '../../data/homeCopy';
import { SERVICE_TIMES, SITE, serviceRange } from '../../data/site';
import { withBase } from '../../lib/base';

export function VisitMap() {
  const { lang } = useLanguage();
  const t = homeCopy[lang];
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(SITE.address);
    } catch {
      // Clipboard API unsupported — still show the confirmation.
    }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="besoek" className="scroll-mt-24 bg-tan py-16">
      <div className="mx-auto grid max-w-content grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-5 px-7">
        <div className="rounded-card-lg bg-cream-card p-7 shadow-card">
          <div className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-orange">
            {t.visitEyebrow}
          </div>
          <h2 className="mb-6 font-serif text-2xl font-medium text-ink">{t.visitHeading}</h2>

          <div className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-slate-muted">
            {t.visitAddressLabel}
          </div>
          <p className="mb-4 text-ink">{SITE.address}</p>
          <button
            type="button"
            onClick={copyAddress}
            className={`mb-6 rounded-pill px-4 py-2 text-[12.5px] font-semibold ${
              copied ? 'bg-navy text-white' : 'border border-strong text-ink hover:border-navy'
            }`}
          >
            {copied ? t.addressCopied : t.copyAddress}
          </button>

          <div className="mb-6 flex flex-col gap-2 border-t border-subtle pt-5">
            {SERVICE_TIMES.map((entry) => (
              <div key={entry.en} className="flex justify-between text-sm">
                <span className="text-slate">{entry[lang]}</span>
                <span className="font-bold text-ink">Sat {serviceRange(entry)}</span>
              </div>
            ))}
          </div>

          <a
            href={SITE.directionsUrl}
            target="_blank"
            rel="noopener"
            className="mb-3 block rounded-pill bg-orange px-5 py-3 text-center font-semibold text-white hover:bg-orange-hover"
          >
            {t.directionsCta} →
          </a>
          <a
            href={SITE.appleMapsUrl}
            target="_blank"
            rel="noopener"
            className="block text-center text-sm font-semibold text-navy hover:text-orange"
          >
            {t.appleMapsCta}
          </a>
        </div>

        <div className="flex flex-col">
          <div className="relative min-h-[300px] flex-1 overflow-hidden rounded-card-lg">
            <iframe
              src={withBase('/map.html')}
              title="Tygerberg SDA Kerk — kaart"
              loading="lazy"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
          {/*
            The map's tile credit, required by the ODbL and OSM's tile policy.
            It used to sit in the map's own bottom-right corner, which put a
            white box over a map this size; the OSMF guidelines allow it
            adjacent to the map instead, so it lives here. Not decoration and
            not optional — removing it breaks the licence the tiles come under.

            Untranslated on purpose: it is a proper noun and a copyright mark.
            Sized and coloured to stay comfortably readable, which the
            guidelines also ask for.
          */}
          <p className="mt-2 text-right text-xs text-slate">
            ©{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener"
              className="underline decoration-subtle underline-offset-2 hover:text-navy"
            >
              OpenStreetMap
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
