import { LanguageProvider } from '../../context/LanguageContext';
import { Header } from './Header';
import { Hero } from './Hero';
import { ServiceTimesStrip } from './ServiceTimesStrip';
import { ThisWeek } from './ThisWeek';
import { AboutCarousel } from './AboutCarousel';
import { BeliefsSummary } from './BeliefsSummary';
import { GetInvolved } from './GetInvolved';
import { Resources } from './Resources';
import { VisitMap } from './VisitMap';
import { Footer } from './Footer';

export function Home() {
  return (
    <LanguageProvider>
      <div className="min-h-screen overflow-x-hidden font-sans text-ink">
        <Header />
        <a id="top" />
        <Hero />
        <ServiceTimesStrip />
        <ThisWeek />
        <AboutCarousel />
        <BeliefsSummary />
        <GetInvolved />
        <Resources />
        <VisitMap />
        <Footer />
      </div>
    </LanguageProvider>
  );
}
