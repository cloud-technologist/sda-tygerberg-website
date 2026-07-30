import { SITE, SABBATH_HOURS } from '../data/site';

/**
 * schema.org description of the congregation, emitted on every page, so a search
 * engine can answer "when does Tygerberg SDA meet". Restates what is already on
 * the page; both read from src/data/site.ts, so there is nothing to sync.
 */
export function churchJsonLd(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Church',
    // The congregation, not the page — every page emits the same node.
    '@id': new URL('#church', site).href,
    name: 'Tygerberg Sewendedag Adventiste Kerk',
    alternateName: ['Tygerberg SDA Kerk', 'Tygerberg Seventh-day Adventist Church'],
    url: site.href,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '54 Boston St',
      addressLocality: 'Boston, Bellville',
      addressRegion: 'Western Cape',
      postalCode: '7530',
      addressCountry: 'ZA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE.lat,
      longitude: SITE.lng,
    },
    hasMap: SITE.directionsUrl,
    sameAs: [SITE.youtubeChannelUrl],
    // One span, not three: three would claim the building shuts between
    // services. This describes when the place is open.
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'https://schema.org/Saturday',
        opens: SABBATH_HOURS.opens,
        closes: SABBATH_HOURS.closes,
      },
    ],
  };
}
