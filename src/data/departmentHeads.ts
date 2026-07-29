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
   * Root-relative path to the web master under `public/images/hod/`, derived
   * from the studio original in `src/images/` by `tools/build-headshots.mjs`.
   *
   * Not a finished image URL: the carousel resizes it per viewport through
   * Cloudflare (`src/lib/cdnImage.ts`), so this must stay a plain path that
   * both the transformer and the no-transform fallback can resolve.
   *
   * Photos are named for the person, so the file for someone whose card is
   * removed should go with it — the master is a public URL whether or not
   * anything links to it.
   */
  photoUrl?: string;
};

/**
 * Ten of the twenty have headshots (the board's studio session); the rest keep
 * the striped placeholder until photos arrive. Adding one is two steps: run
 * `tools/build-headshots.mjs` with the original in `src/images/`, then set
 * `photoUrl` here. No component change.
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
    photoUrl: '/images/hod/TG-DH-Jaco.jpg',
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
    // "Graig" is the studio's spelling of the filename, kept verbatim so the
    // web master is a straight derivation of the original. The roster spells
    // him Craig, and that is what the card shows.
    photoUrl: '/images/hod/TG-DH-Graig.jpg',
  },
  {
    id: 'diakonesse',
    name: 'Marinda Wallace',
    roles: { af: ['Hoofdiakones'], en: ['Head Deaconess'] },
    photoUrl: '/images/hod/TG-DH-Marinda.jpg',
  },
  {
    id: 'sabbatskool',
    name: 'Gustav Allmann',
    roles: { af: ['Sabbatskool'], en: ['Sabbath School'] },
    photoUrl: '/images/hod/TG-DH-Gustav.jpg',
  },
  {
    id: 'kinderbediening',
    name: 'Lenie Virgin',
    roles: {
      af: ['Kinderbediening', 'Gemeenskapsdienste & Welsyn'],
      en: ['Children’s Ministry', 'Community Services & Welfare'],
    },
    photoUrl: '/images/hod/TG-DH-Lenie.jpg',
  },
  {
    id: 'senior-jeug',
    name: 'Monique Spammer',
    roles: { af: ['Senior Jeugleier'], en: ['Senior Youth Leader'] },
    photoUrl: '/images/hod/TG-DH-Monique.jpg',
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
    photoUrl: '/images/hod/TG-DH-Leonie.jpg',
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
    photoUrl: '/images/hod/TG-DH-Linda.jpg',
  },
  {
    id: 'mannebediening',
    name: 'Marius Louw',
    roles: { af: ['Mannebediening'], en: ['Men’s Ministry'] },
    photoUrl: '/images/hod/TG-DH-Marius.jpg',
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
    photoUrl: '/images/hod/TG-DH-Hanlie.jpg',
  },
  {
    id: 'gesinsbediening',
    name: 'Louw Familie',
    roles: { af: ['Gesinsbediening'], en: ['Family Ministry'] },
  },
];

/*
 * One studio photo has no card: `src/images/TG-DH-Laura.jpg`. There is no
 * Laura on the Ampsdraers 2025/2026 roster the list above is built from, and
 * the other ten filenames match a roster first name exactly, so this one is
 * not a spelling variant of anybody here. It has deliberately not been built
 * into `public/images/hod/` — that directory is served publicly, and a
 * headshot should not go up until it is clear whose it is.
 *
 * To publish it once the board confirms: add the filename to HEADSHOTS in
 * tools/build-headshots.mjs, re-run it, and set `photoUrl` on the right card.
 */
