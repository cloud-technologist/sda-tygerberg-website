import type { Lang } from './site';

/**
 * Department leads from the board's "Tygerberg-Gemeente Ampsdraers 2025/2026"
 * roster — for each department the person the roster marks `hoof`,
 * `koördineerder`, `leier`, `direkteur`, `superintendent`, or lists first.
 * Assistants are deliberately left out; this is the "who leads what" carousel,
 * not the full roster.
 *
 * Names only, by design. No phone numbers or email addresses — those were
 * stripped site-wide for POPIA (see README "Known open items") and the
 * /verbind form is the compliant way to reach a person now.
 *
 * `id` (not `name`) keys the carousel: several people lead more than one
 * department, and names alone are not unique across the roster.
 */
export type DepartmentHead = {
  id: string;
  name: string;
  role: Record<Lang, string>;
  photoUrl?: string;
};

/** Photos are still TBA from the board — add `photoUrl` per person as they arrive. */
export const departmentHeads: DepartmentHead[] = [
  {
    id: 'leraar',
    name: 'Arnold Neuhoff',
    role: { af: 'Leraar', en: 'Pastor' },
  },
  {
    id: 'hoofouderling',
    name: 'Jaco van Niekerk',
    role: {
      af: 'Hoofouderling · Persoonlike Bediening',
      en: 'Head Elder · Personal Ministries',
    },
  },
  {
    id: 'hoofdiaken',
    name: 'Craig Campion',
    role: { af: 'Hoofdiaken', en: 'Head Deacon' },
  },
  {
    id: 'hoofdiakones',
    name: 'Marinda Wallace',
    role: { af: 'Hoofdiakones', en: 'Head Deaconess' },
  },
  {
    id: 'sabbatskool',
    name: 'Gustav Allmann',
    role: { af: 'Sabbatskool-superintendent', en: 'Sabbath School Superintendent' },
  },
  {
    id: 'kinderbediening',
    name: 'Lenie Virgin',
    role: {
      af: 'Kinderbediening · Gemeenskapsdiens & Welsyn',
      en: 'Children’s Ministry · Community Services & Welfare',
    },
  },
  {
    id: 'senior-jeug',
    name: 'Monique Spammer',
    role: { af: 'Senior Jeugleier (18–35)', en: 'Senior Youth Leader (18–35)' },
  },
  {
    id: 'tiener-jeug',
    name: 'Lané Louw',
    role: { af: 'Tienerjeugleier (13–18)', en: 'Teen Youth Leader (13–18)' },
  },
  {
    id: 'strewers',
    name: 'Morné Louw',
    role: { af: 'Strewersleier · Gesinsbediening', en: 'Pathfinder Leader · Family Ministry' },
  },
  {
    id: 'gesinsbediening',
    name: 'Lelani Louw',
    role: { af: 'Gesinsbediening', en: 'Family Ministry' },
  },
  {
    id: 'musiek',
    name: 'Leonie Cloete',
    role: { af: 'Musiek', en: 'Music' },
  },
  {
    id: 'multimedia',
    name: 'Chris Meyer',
    role: { af: 'Multimedia', en: 'Multimedia' },
  },
  {
    id: 'gesondheidsbediening',
    name: 'Gert Coetzee',
    role: {
      af: 'Gesondheidsbediening · Misbruikvoorkoming (APO)',
      en: 'Health Ministry · Abuse Prevention (APO)',
    },
  },
  {
    id: 'vrouebediening',
    name: 'Linda Jennings',
    role: { af: 'Vrouebediening', en: 'Women’s Ministry' },
  },
  {
    id: 'mannebediening',
    name: 'Marius Louw',
    role: { af: 'Mannebediening', en: 'Men’s Ministry' },
  },
  {
    id: 'gebed',
    name: 'Peter Wallace',
    role: { af: 'Gebedskoördineerder', en: 'Prayer Coordinator' },
  },
  {
    id: 'rentmeesterskap',
    name: 'Leroy Spammer',
    role: { af: 'Rentmeesterskap', en: 'Stewardship' },
  },
  {
    id: 'tesourier',
    name: 'Adéle Meyer',
    role: { af: 'Tesourier', en: 'Treasurer' },
  },
  {
    id: 'kerkklerk',
    name: 'Sanet Stevens',
    role: { af: 'Kerkklerk', en: 'Church Clerk' },
  },
  {
    id: 'kommunikasie',
    name: 'Madeleine Cloete',
    role: { af: 'Kommunikasie', en: 'Communications' },
  },
  {
    id: 'ontspanning',
    name: 'Hanlie Tolmay',
    role: { af: 'Ontspanning', en: 'Recreation' },
  },
  {
    id: 'boukommittee',
    name: 'Bertie Hoffman',
    role: { af: 'Boukommittee', en: 'Building Committee' },
  },
];
