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
  youtubeVideosUrl: 'https://www.youtube.com/@SDATygerberg/videos',
  // Channel's auto-generated "uploads" playlist — always shows the latest video, zero maintenance.
  // youtube-nocookie.com (privacy-enhanced mode), not youtube.com — the regular
  // embed domain relies on third-party storage access that iOS Safari's tracking
  // prevention blocks, leaving a blank black box with nothing rendered. The
  // nocookie domain doesn't depend on that and loads reliably there.
  youtubeUploadsEmbedUrl: 'https://www.youtube-nocookie.com/embed/videoseries?list=UUtZlioPBBORWMMMSJ9BE1Wg',
  // Self-hosted so the download works without depending on an external site.
  beliefsPdfPath: '/SDA-28-Fundamental-Beliefs.pdf',
} as const;

export const SERVICE_TIMES: { af: string; en: string; time: string }[] = [
  { af: 'Sabbatskool', en: 'Sabbath School', time: '09:30' },
  { af: 'Lesstudie', en: 'Lesson Study', time: '10:00' },
  { af: 'Hoofdiens', en: 'Divine Service', time: '11:00' },
];
