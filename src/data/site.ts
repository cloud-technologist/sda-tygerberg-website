export type Lang = 'af' | 'en';

export const SITE = {
  name: 'Tygerberg SDA',
  address: '54 Boston St, Boston, Cape Town, 7530',
  lat: -33.8974,
  lng: 18.6235,
  directionsUrl:
    'https://www.google.com/maps/dir//Tygerberg+SDA+Kerk,+54+Boston+St,+Boston,+Cape+Town,+7530',
  appleMapsUrl: 'https://maps.apple.com/?address=54%20Boston%20St,%20Boston,%20Cape%20Town,%207530',
  youtubeChannelUrl: 'https://www.youtube.com/@SDATygerberg',
  // Channel home ("Featured"), not /videos — /videos lands on the raw upload
  // list, which surfaced an old section rather than what the channel curates.
  youtubeFeaturedUrl: 'https://www.youtube.com/@SDATygerberg/featured',
  // Channel's auto-generated "uploads" playlist — always shows the latest video, zero maintenance.
  // youtube-nocookie.com (privacy-enhanced mode), not youtube.com — the regular
  // embed domain relies on third-party storage access that iOS Safari's tracking
  // prevention blocks, leaving a blank black box with nothing rendered. The
  // nocookie domain doesn't depend on that and loads reliably there.
  youtubeUploadsEmbedUrl: 'https://www.youtube-nocookie.com/embed/videoseries?list=UUtZlioPBBORWMMMSJ9BE1Wg',
  // Self-hosted so the download works without depending on an external site.
  beliefsPdfPath: '/SDA-28-Fundamental-Beliefs.pdf',
} as const;

export type ServiceTime = { af: string; en: string; start: string; end: string };

/**
 * The Sabbath morning, in order. Times confirmed by the church.
 *
 * Both ends are kept because a start on its own doesn't tell a first-time
 * visitor whether they are committing to half an hour or to the whole morning.
 */
export const SERVICE_TIMES: ServiceTime[] = [
  { af: 'Sabbatskool', en: 'Sabbath School', start: '09:30', end: '10:00' },
  { af: 'Lesstudie', en: 'Lesson Study', start: '10:00', end: '10:45' },
  { af: 'Hoofdiens', en: 'Divine Service', start: '11:00', end: '12:00' },
];

/** "09:30 – 10:00", matching how the midweek schedule already reads. */
export const serviceRange = (s: ServiceTime) => `${s.start} – ${s.end}`;

/**
 * When the building itself is open on a Sabbath, per the church.
 *
 * Deliberately wider than the services above and deliberately not derived from
 * them: the doors open half an hour before Sabbath School and stay open half an
 * hour after the Divine Service ends. This is what `openingHoursSpecification`
 * means in structured data — when someone can arrive and find the place open,
 * not when the programme runs.
 */
export const SABBATH_HOURS = {
  opens: '09:00',
  closes: '12:30',
} as const;
