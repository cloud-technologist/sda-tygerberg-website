import type { Lang } from './site';

/**
 * Department heads as confirmed by the church board, cross-checked against the
 * "Tygerberg-Gemeente Ampsdraers 2025/2026" roster.
 *
 * One card per person, not one per position: several people head more than one
 * department, so their titles are merged onto a single headshot rather than
 * repeating the same face through the carousel. `roles` is therefore a list.
 *
 * Names only, by design. No phone numbers or email addresses — those were
 * stripped site-wide for POPIA (see README "Known open items") and the
 * /connect form is the compliant way to reach a person now.
 *
 * `id` (not `name`) keys the carousel — it stays stable if a name is corrected.
 */
export type DepartmentHead = {
  id: string;
  name: string;
  roles: Record<Lang, string[]>;
  /** Shown under the roles — for a post that's covered rather than filled. */
  note?: Record<Lang, string>;
  photoUrl?: string;
};

/** Photos are still TBA from the board — add `photoUrl` per person as they arrive. */
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
      af: ['Ouderlinge', 'Persoonlike Bediening', 'Strategiesebeplannings-komitee'],
      en: ['Elders', 'Personal Ministries', 'Strategic Planning Committee'],
    },
  },
  {
    id: 'diakens',
    name: 'Craig Campion',
    roles: {
      af: ['Diakonie · Diakens', 'Veiligheidsoffisier'],
      en: ['Deaconry · Deacons', 'Safety Officer'],
    },
    note: {
      af: 'Veiligheidsoffisier het tans geen amptelike hoof nie — waargeneem deur die hoofdiaken.',
      en: 'Safety Officer has no official head at present — covered by the head deacon.',
    },
  },
  {
    id: 'diakonesse',
    name: 'Marinda Wallace',
    roles: { af: ['Diakonie · Diakonesse'], en: ['Deaconry · Deaconesses'] },
  },
  {
    id: 'sabbatskool',
    name: 'Gustav Allmann',
    roles: { af: ['Sabbatskool'], en: ['Sabbath School'] },
  },
  {
    id: 'kinderbediening',
    name: 'Lenie Virgin',
    roles: {
      af: ['Kinderbediening', 'Gemeenskapsdienste & Welsyn'],
      en: ['Children’s Ministry', 'Community Services & Welfare'],
    },
  },
  {
    id: 'senior-jeug',
    name: 'Monique Spammer',
    roles: { af: ['Senior Jeugleier'], en: ['Senior Youth Leader'] },
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
  },
  {
    id: 'mannebediening',
    name: 'Marius Louw',
    roles: { af: ['Mannebediening'], en: ['Men’s Ministry'] },
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
  },
  {
    id: 'gesinsbediening',
    name: 'Louw Familie',
    roles: { af: ['Gesinsbediening'], en: ['Family Ministry'] },
  },
];
