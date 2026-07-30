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
  /** Singular job titles — each card is one person, not a department listing. */
  roles: Record<Lang, string[]>;
  /**
   * Just the filename of the headshot, e.g. `TG-DH-Jaco.jpg`.
   *
   * Not a URL, and deliberately not a path: there are two copies of every
   * photo — the full-size original Cloudflare transforms, and the pre-resized
   * fallback served when it can't — and `src/lib/cdnImage.ts` builds both from
   * this one name so they cannot drift apart.
   *
   * Photos are named for the person, so the files for someone whose card is
   * removed should go with it: `public/` is a public URL whether or not
   * anything links to it.
   */
  photo?: string;
};

/**
 * Eleven of the twenty-one have headshots (the board's studio session); the
 * rest keep the striped placeholder until photos arrive. Adding one is three
 * steps: drop the original into `public/images/hod/`, run
 * `node tools/build-headshots.mjs` for its fallback copy, then set `photo`
 * here. No component change.
 */
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
    // Surname still outstanding — the board gave the portfolio, not the full
    // name. One word to fix here when it arrives; `id` is what the carousel
    // keys on, so it will not move when it does.
    name: 'Laura',
    // Sits next to Jaco on purpose. He holds "Persoonlike Bediening" as an
    // elder, she chairs the committee under it, and the roster the rest of this
    // list came from records only his half — so the adjacency is what says
    // these are one thread of work rather than a duplicated title.
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
    // "Graig" is the studio's spelling of the filename, kept verbatim so both
    // copies stay straight derivations of what the photographer delivered. The
    // roster spells him Craig, and that is what the card shows.
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
