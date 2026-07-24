import type { Lang } from './site';

// Real names + headshots are TBA from the church board (see README "Open Items").
// Swap `name` and `photoUrl` per person here without touching the carousel component.
export type DepartmentHead = {
  name: string;
  dept: Record<Lang, string>;
  photoUrl?: string;
};

export const departmentHeads: DepartmentHead[] = [
  { name: '[Naam 1]', dept: { af: 'Sabbatskool', en: 'Sabbath School' } },
  { name: '[Naam 2]', dept: { af: 'Persoonlike Bediening', en: 'Personal Ministries' } },
  { name: '[Naam 3]', dept: { af: 'Jeug & Kinders', en: 'Youth & Children' } },
  { name: '[Naam 4]', dept: { af: 'Musiek & Aanbidding', en: 'Music & Worship' } },
  { name: '[Naam 5]', dept: { af: 'Gesondheidsbediening', en: 'Health Ministry' } },
  { name: '[Naam 6]', dept: { af: 'Diakonie', en: 'Deaconry' } },
];
