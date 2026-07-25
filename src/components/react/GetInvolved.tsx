import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { homeCopy } from '../../data/homeCopy';
import { BANKING_DETAILS, givingCopy } from '../../data/giving';

export function GetInvolved() {
  const { lang } = useLanguage();
  const t = homeCopy[lang];
  const g = givingCopy[lang];
  const [showBanking, setShowBanking] = useState(false);

  const cardClass = (tint: boolean) =>
    `rounded-card-lg border p-6.5 ${tint ? 'border-orange/40 bg-orange/15' : 'border-white/15 bg-white/10'}`;

  return (
    <section id="betrokke" className="scroll-mt-24 bg-navy py-16 text-white">
      <div className="mx-auto max-w-content px-7">
        <h2 className="mb-10 text-center font-serif text-[34px] font-medium">
          {t.involvedHeading}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] items-start gap-5">
          <div className={cardClass(false)}>
            <div className="mb-2.5 font-serif text-xl">{t.connectTitle}</div>
            <p className="text-sm leading-relaxed text-blue-pale">{t.connectDesc}</p>
          </div>

          <div className={cardClass(false)}>
            <div className="mb-2.5 font-serif text-xl">{t.studyTitle}</div>
            <p className="text-sm leading-relaxed text-blue-pale">{t.studyDesc}</p>
          </div>

          <div className={`${cardClass(true)} flex flex-col`}>
            <div className="mb-2.5 font-serif text-xl">{t.giveTitle}</div>
            <p className="mb-4 text-sm leading-relaxed text-blue-pale">{t.giveDesc}</p>
            <button
              type="button"
              onClick={() => setShowBanking((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-pill bg-orange px-4 py-2 text-[13px] font-bold text-white hover:bg-orange-hover"
            >
              {t.giveCta} {showBanking ? '–' : '+'}
            </button>

            {showBanking && (
              <div className="mt-4 rounded-card bg-navy-deep/60 p-4 text-sm leading-relaxed text-blue-pale">
                <div className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-orange">
                  {g.accountDetailsLabel}
                </div>
                <div className="mb-2 font-serif text-base text-white">
                  {BANKING_DETAILS.organisation}
                </div>
                <dl className="mb-3 grid grid-cols-[auto,1fr] gap-x-3 gap-y-1">
                  <dt className="text-blue-muted">{g.bankLabel}</dt>
                  <dd>{BANKING_DETAILS.bank}</dd>
                  <dt className="text-blue-muted">{g.accountNumberLabel}</dt>
                  <dd>{BANKING_DETAILS.accountNumber}</dd>
                  <dt className="text-blue-muted">{g.branchCodeLabel}</dt>
                  <dd>{BANKING_DETAILS.branchCode}</dd>
                  <dt className="text-blue-muted">{g.referenceLabel}</dt>
                  <dd>{g.referenceNote}</dd>
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
