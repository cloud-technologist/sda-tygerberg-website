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
  youtubeUploadsEmbedUrl: 'https://www.youtube.com/embed/videoseries?list=UUtZlioPBBORWMMMSJ9BE1Wg',
  // Self-hosted so the download works without depending on an external site.
  beliefsPdfPath: '/SDA-28-Fundamental-Beliefs.pdf',
  // Manual live-stream flag for MVP — no backend/YouTube Data API key wired up yet.
  // Flip to true when the church is actively streaming; the video area otherwise
  // always falls back to the uploads-playlist embed above.
  isLive: false,
} as const;

export const SERVICE_TIMES: { af: string; en: string; time: string }[] = [
  { af: 'Sabbatskool', en: 'Sabbath School', time: '09:30' },
  { af: 'Lesstudie', en: 'Lesson Study', time: '10:00' },
  { af: 'Hoofdiens', en: 'Divine Service', time: '11:00' },
];
