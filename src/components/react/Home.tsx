import { LanguageProvider } from '../../context/LanguageContext';
import { Header } from './Header';
import { Hero } from './Hero';
import { ServiceTimesStrip } from './ServiceTimesStrip';
import { ThisWeek } from './ThisWeek';
import { AboutCarousel } from './AboutCarousel';
import { BeliefsSummary } from './BeliefsSummary';
import { GetInvolved } from './GetInvolved';
import { Resources } from './Resources';
import { FirstVisit } from './FirstVisit';
import { VisitMap } from './VisitMap';
import { Footer } from './Footer';

export function Home() {
  return (
    <LanguageProvider>
      <div className="min-h-screen font-sans text-ink">
        <Header />
        <a id="top" />
        {/* The landmark starts after the header so the skip link actually skips
            the nav — that is the whole point of it. */}
        <main id="main">
          <Hero />
          <ServiceTimesStrip />
          <ThisWeek />
          <AboutCarousel />
          <BeliefsSummary />
          <GetInvolved />
          <Resources />
          <FirstVisit />
          <VisitMap />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
