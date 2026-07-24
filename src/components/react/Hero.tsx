import { useLanguage } from '../../context/LanguageContext';
import { homeCopy } from '../../data/homeCopy';
import { SITE } from '../../data/site';
import { useLiveStatus } from './useLiveStatus';

export function Hero() {
  const { lang } = useLanguage();
  const t = homeCopy[lang];
  const isLive = useLiveStatus();

  return (
    <section className="mx-auto grid max-w-content grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-center gap-13 px-7 pb-10 pt-15">
      <div>
        <div className="mb-5 text-xs font-bold uppercase tracking-[.16em] text-orange">
          {t.heroEyebrow}
        </div>
        <h1 className="mb-5 text-balance font-serif text-[clamp(34px,5vw,56px)] font-medium leading-[1.08] tracking-[-.015em] text-ink">
          {t.heroTitle}
        </h1>
        <p className="mb-7 max-w-[460px] text-[17px] leading-relaxed text-slate">{t.heroSub}</p>
        <div className="flex flex-wrap gap-3.5">
          <a
            href={SITE.directionsUrl}
            target="_blank"
            rel="noopener"
            className="rounded-pill bg-navy px-6.5 py-3.5 text-[15px] font-semibold text-white hover:bg-navy-deep"
          >
            {t.ctaVisit}
          </a>
          <a
            href={SITE.youtubeChannelUrl}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2 rounded-pill border-[1.5px] border-navy px-6.5 py-3.5 text-[15px] font-semibold text-navy hover:bg-navy hover:text-white"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-orange" />
            {t.ctaWatch}
          </a>
        </div>
      </div>

      <div id="stroom" className="scroll-mt-24">
        <div className="overflow-hidden rounded-card-lg bg-navy-deep shadow-deep">
          <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
            {isLive && (
              <div className="absolute left-3.5 top-3.5 z-10 flex items-center gap-1.5 rounded-pill bg-orange/95 px-2.5 py-1.5 text-[11px] font-extrabold tracking-[.08em] text-white">
                <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-white" />
                {t.liveLabel}
              </div>
            )}
            <iframe
              src={SITE.youtubeUploadsEmbedUrl}
              title="Tygerberg SDA YouTube"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
          <div className="flex items-center justify-end p-4">
            <a
              href={SITE.youtubeVideosUrl}
              target="_blank"
              rel="noopener"
              className="rounded-pill bg-orange px-4.5 py-2 text-[12.5px] font-bold text-white hover:bg-orange-hover"
            >
              {t.tabReplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
