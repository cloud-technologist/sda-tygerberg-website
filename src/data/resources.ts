import type { Lang } from './site';

export type Resource = {
  name: Record<Lang, string>;
  domain: string;
  url: string;
  // Self-hosted under /logos — downloaded from the source, not hot-linked.
  logo: string;
};

export const resources: Resource[] = [
  {
    name: { af: 'Lesstudie Biblioteek', en: 'Lesson Study Library' },
    domain: 'sabbath-school.adventech.io',
    url: 'https://sabbath-school.adventech.io/af',
    logo: '/logos/sabbath-school.png',
  },
  {
    name: { af: 'HomebaseTV Afrikaans', en: 'HomebaseTV Afrikaans' },
    domain: 'homebasetv.org',
    url: 'https://homebasetv.org/',
    logo: '/logos/homebasetv.png',
  },
  {
    name: { af: 'AWR Afrikaans', en: 'AWR Afrikaans' },
    domain: 'awr.org',
    url: 'https://awr.org/',
    logo: '/logos/awr.png',
  },
];
