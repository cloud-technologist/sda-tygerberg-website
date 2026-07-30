import type { Lang } from './site';

/**
 * Department heads, cross-checked against the "Ampsdraers 2025/2026" roster.
 *
 * One card per person, not per position — `roles` is a list because several
 * people head more than one department. `id` keys the carousel, so it survives
 * a name correction.
 *
 * Names only: no phone numbers or email addresses anywhere here — CONCERNS.md
 * C-20.
 */
export type DepartmentHead = {
  id: string;
  name: string;
  /** Singular job titles — each card is one person, not a department listing. */
  roles: Record<Lang, string[]>;
  /**
   * Filename only, e.g. `TG-DH-Jaco.jpg` — not a path. Every photo has two
   * copies and cdnImage.ts derives both from this one name so they cannot
   * drift. Delete the files with the card: `public/` is a live URL either way.
   */
  photo?: string;
};

/** 11 of 21 have headshots; the rest show the placeholder. README to add one. */
export const departmentHeads: DepartmentHead[] = [
  {
    id: 'kerkraad',
    name: 'Lr. Arnold Neuhoff',
    roles: { af: ['Leraar', 'Kerkraad'], en: ['Pastor', 'Church Board'] },
  },
  {
    id: 'ouderlinge',
    name: 'Jaco van Niekerk',
    roles: {
      af: ['Ouderling', 'Persoonlike Bediening', 'Strategiesebeplannings-komitee'],
      en: ['Elder', 'Personal Ministries', 'Strategic Planning Committee'],
    },
    photo: 'TG-DH-Jaco.jpg',
  },
  {
    id: 'persoonlike-bediening',
    name: 'Laura Rolff',
    // Next to Jaco on purpose: he holds "Persoonlike Bediening" as an elder,
    // she chairs the committee under it. Not a duplicated title.
    roles: {
      af: ['Persoonlike Bedieningkomitee', 'Evangelisasie'],
      en: ['Personal Ministries Committee', 'Evangelism'],
    },
    photo: 'TG-DH-Laura.jpg',
  },
  {
    id: 'diakens',
    name: 'Craig Campion',
    // Veiligheidsoffisier has no official head on the board's list; the head
    // deacon carries it, so it sits here as a plain title.
    roles: {
      af: ['Hoofdiaken', 'Veiligheidsoffisier'],
      en: ['Head Deacon', 'Safety Officer'],
    },
    // "Graig" is the studio's filename, kept verbatim; the roster spells him
    // Craig, which is what the card shows.
    photo: 'TG-DH-Graig.jpg',
  },
  {
    id: 'diakonesse',
    name: 'Marinda Wallace',
    roles: { af: ['Hoofdiakones'], en: ['Head Deaconess'] },
    photo: 'TG-DH-Marinda.jpg',
  },
  {
    id: 'sabbatskool',
    name: 'Gustav Allmann',
    roles: { af: ['Sabbatskool'], en: ['Sabbath School'] },
    photo: 'TG-DH-Gustav.jpg',
  },
  {
    id: 'kinderbediening',
    name: 'Lenie Virgin',
    roles: {
      af: ['Kinderbediening', 'Gemeenskapsdienste & Welsyn'],
      en: ['Children’s Ministry', 'Community Services & Welfare'],
    },
    photo: 'TG-DH-Lenie.jpg',
  },
  {
    id: 'senior-jeug',
    name: 'Monique Spammer',
    roles: { af: ['Senior Jeugleier'], en: ['Senior Youth Leader'] },
    photo: 'TG-DH-Monique.jpg',
  },
  {
    id: 'junior-jeug',
    name: 'Lisa Branders',
    roles: { af: ['Junior Jeugleier'], en: ['Junior Youth Leader'] },
  },
  {
    id: 'strewers',
    name: 'Morné Louw',
    roles: { af: ['Strewersleier'], en: ['Pathfinder Leader'] },
  },
  {
    id: 'musiek',
    name: 'Leonie Cloete',
    roles: { af: ['Musiek'], en: ['Music'] },
    photo: 'TG-DH-Leonie.jpg',
  },
  {
    id: 'tesourier',
    name: 'Adéle Meyer',
    roles: { af: ['Tesourier'], en: ['Treasurer'] },
  },
  {
    id: 'multimedia',
    name: 'Chris Meyer',
    roles: {
      af: ['Multimedia', 'Kommunikasie-verteenwoordiger'],
      en: ['Multimedia', 'Communications Representative'],
    },
  },
  {
    id: 'gesondheidsbediening',
    name: 'Gert Coetzee',
    roles: {
      af: ['Gesondheidsbediening & APO'],
      en: ['Health Ministry & APO'],
    },
  },
  {
    id: 'gebed',
    name: 'Peter Wallace',
    roles: { af: ['Gebedskoördineerder'], en: ['Prayer Coordinator'] },
  },
  {
    id: 'kerkklerk',
    name: 'Sanet Stevens',
    roles: { af: ['Kerkklerk'], en: ['Church Clerk'] },
  },
  {
    id: 'vrouebediening',
    name: 'Linda Jennings',
    roles: { af: ['Vrouebediening'], en: ['Women’s Ministry'] },
    photo: 'TG-DH-Linda.jpg',
  },
  {
    id: 'mannebediening',
    name: 'Marius Louw',
    roles: { af: ['Mannebediening'], en: ['Men’s Ministry'] },
    photo: 'TG-DH-Marius.jpg',
  },
  {
    id: 'boukomitee',
    name: 'Bertie Hoffman',
    roles: { af: ['Boukomitee'], en: ['Building Committee'] },
  },
  {
    id: 'ontspanningskomitee',
    name: 'Hanlie Tolmay',
    roles: { af: ['Ontspanningskomitee'], en: ['Recreation Committee'] },
    photo: 'TG-DH-Hanlie.jpg',
  },
  {
    id: 'gesinsbediening',
    name: 'Louw Familie',
    roles: { af: ['Gesinsbediening'], en: ['Family Ministry'] },
  },
];
