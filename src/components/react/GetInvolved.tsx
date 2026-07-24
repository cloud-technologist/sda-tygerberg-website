import { useLanguage } from '../../context/LanguageContext';
import { homeCopy } from '../../data/homeCopy';

export function GetInvolved() {
  const { lang } = useLanguage();
  const t = homeCopy[lang];

  // Real contact methods (form/email/phone/giving link) are TBA from the church
  // board — all three currently point at this section as a placeholder.
  const cards = [
    { title: t.connectTitle, desc: t.connectDesc, cta: t.connectCta, tint: false },
    { title: t.studyTitle, desc: t.studyDesc, cta: t.studyCta, tint: false },
    { title: t.giveTitle, desc: t.giveDesc, cta: t.giveCta, tint: true },
  ];

  return (
    <section id="betrokke" className="scroll-mt-24 bg-navy py-16 text-white">
      <div className="mx-auto max-w-content px-7">
        <h2 className="mb-10 text-center font-serif text-[34px] font-medium">
          {t.involvedHeading}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`rounded-card-lg border p-6.5 ${
                card.tint
                  ? 'border-orange/40 bg-orange/15'
                  : 'border-white/15 bg-white/10'
              }`}
            >
              <div className="mb-2.5 font-serif text-xl">{card.title}</div>
              <p className="mb-4 text-sm leading-relaxed text-blue-pale">{card.desc}</p>
              <a href="#betrokke" className="text-sm font-bold text-orange hover:text-white">
                {card.cta} →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
