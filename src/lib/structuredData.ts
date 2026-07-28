import { SITE, SABBATH_HOURS } from '../data/site';

/**
 * schema.org description of the congregation, emitted on every page.
 *
 * This is what lets a search engine answer "when does Tygerberg SDA meet"
 * without a person opening the site. Everything here is already on the page in
 * prose — the markup only restates it in a form a crawler can read, so there is
 * nothing to keep in sync beyond `src/data/site.ts`, which both read from.
 *
 * Written as a plain object rather than an .astro component so the data stays
 * in `src/lib`/`src/data` and only rendering lives in components, matching how
 * the rest of the site is split.
 */
export function churchJsonLd(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Church',
    // A stable identifier for the congregation itself, distinct from the page
    // it happens to appear on — every page emits the same node.
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
    // One span, not three. `openingHoursSpecification` describes when the place
    // is open; emitting the three services separately would claim the building
    // shuts between Lesson Study and the Divine Service.
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
